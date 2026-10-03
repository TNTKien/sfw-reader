import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { readCachedText, writeCachedText } from './cache';
import { naturalCompare, normalizeText } from './text';
import type { ComicDocument, LoadResult, PendingPdf, TextDocument } from '../types';
import type { PDFDocumentProxy } from 'pdfjs-dist';

const IMAGE = /\.(?:jpe?g|png|webp|gif|avif)$/i;
const ARCHIVE = /\.(?:zip|cbz)$/i;
const MAX_FILE_BYTES = 350 * 1024 * 1024;
const MAX_ZIP_ENTRIES = 1500;

function fileId(file: File): string {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

function trimmedName(filename: string): string {
  return filename.replace(/\.[^.]+$/, '');
}

function assertSize(file: File) {
  if (file.size > MAX_FILE_BYTES) throw new Error('This file is over the 350 MB browser limit. Try a smaller book.');
}

function zipPath(base: string, relative: string): string {
  const segments = [...base.split('/').filter(Boolean)];
  for (const fragment of decodeURIComponent(relative.split('#')[0]).split('/')) {
    if (fragment === '..') segments.pop();
    else if (fragment && fragment !== '.') segments.push(fragment);
  }
  return segments.join('/');
}

function parseXml(xml: string): Document {
  const dom = new DOMParser().parseFromString(xml, 'application/xml');
  if (dom.querySelector('parsererror')) throw new Error('Invalid EPUB metadata.');
  return dom;
}

function firstTag(parent: ParentNode, name: string): Element | undefined {
  return Array.from(parent.querySelectorAll('*')).find(el => el.localName === name);
}

async function readEpub(file: File): Promise<TextDocument> {
  const { default: JSZip } = await import('jszip');
  const zip = await JSZip.loadAsync(file);
  if (Object.keys(zip.files).length > MAX_ZIP_ENTRIES) throw new Error('This archive contains too many files.');
  const container = zip.file('META-INF/container.xml');
  if (!container) throw new Error('Missing EPUB container metadata.');
  const containerDoc = parseXml(await container.async('text'));
  const opfPath = firstTag(containerDoc, 'rootfile')?.getAttribute('full-path');
  if (!opfPath) throw new Error('Could not locate the EPUB package.');
  const packageFile = zip.file(opfPath);
  if (!packageFile) throw new Error('Missing EPUB package.');
  const packageDoc = parseXml(await packageFile.async('text'));
  const opfDir = opfPath.includes('/') ? opfPath.slice(0, opfPath.lastIndexOf('/')) : '';
  const manifest = new Map<string, string>();
  for (const node of Array.from(packageDoc.getElementsByTagName('*'))) {
    if (node.localName === 'item') {
      const id = node.getAttribute('id');
      const href = node.getAttribute('href');
      if (id && href && /(?:xhtml|html)/i.test(node.getAttribute('media-type') ?? '')) {
        manifest.set(id, zipPath(opfDir, href));
      }
    }
  }
  const paths = Array.from(packageDoc.getElementsByTagName('*'))
    .filter(node => node.localName === 'itemref')
    .map(node => manifest.get(node.getAttribute('idref') ?? ''))
    .filter((path): path is string => Boolean(path && zip.file(path)));
  if (!paths.length) throw new Error('No readable chapters found in this EPUB.');
  const chapterCache = new Map<number, string>();
  const headings = paths.map((_, index) => `Chapter ${index + 1}`);
  const loadChapter = async (index: number): Promise<string> => {
    if (chapterCache.has(index)) return chapterCache.get(index)!;
    const entry = zip.file(paths[index]);
    if (!entry) return '';
    const markup = await entry.async('text');
    const doc = new DOMParser().parseFromString(markup, 'text/html');
    doc.querySelectorAll('script,style,nav,svg,head,aside').forEach(node => node.remove());
    const heading = doc.body.querySelector('h1,h2,h3')?.textContent?.trim();
    if (heading) headings[index] = heading.slice(0, 90);
    const blocks = Array.from(doc.body.querySelectorAll('h1,h2,h3,h4,p,li,blockquote,pre'));
    const raw = blocks.length
      ? blocks.map(node => node.textContent?.trim() ?? '').filter(Boolean).join('\n\n')
      : (doc.body.textContent ?? '');
    const value = normalizeText(raw);
    chapterCache.set(index, value);
    return value;
  };
  await loadChapter(0);
  return {
    kind: 'text', id: fileId(file), name: trimmedName(file.name),
    chapters: headings.map(title => ({ title })), getText: loadChapter,
    dispose: () => chapterCache.clear(),
  };
}

function readTxt(file: File): TextDocument {
  let cache: string | undefined;
  return {
    kind: 'text', id: fileId(file), name: trimmedName(file.name),
    chapters: [{ title: 'Full text' }],
    getText: async () => (cache ??= normalizeText(await file.text())),
    dispose: () => { cache = undefined; },
  };
}

function readImages(files: File[]): ComicDocument {
  const sorted = [...files].sort((a, b) => naturalCompare(a.name, b.name));
  const cache = new Map<number, string>();
  return {
    kind: 'comic', id: files.map(fileId).join('|'), name: sorted.length === 1 ? trimmedName(sorted[0].name) : 'Image collection',
    pageCount: sorted.length,
    getImage: async i => {
      if (i < 0 || i >= sorted.length) throw new Error('Page not found.');
      if (!cache.has(i)) cache.set(i, URL.createObjectURL(sorted[i]));
      return cache.get(i)!;
    },
    dispose: () => { for (const url of cache.values()) URL.revokeObjectURL(url); cache.clear(); },
  };
}

async function readComicZip(file: File): Promise<ComicDocument> {
  const { default: JSZip } = await import('jszip');
  const zip = await JSZip.loadAsync(file);
  const files = Object.values(zip.files)
    .filter(entry => !entry.dir && IMAGE.test(entry.name) && !entry.name.split('/').some(part => part.startsWith('__MACOSX')))
    .sort((a, b) => naturalCompare(a.name, b.name));
  if (!files.length) throw new Error('No supported images found in this archive.');
  if (files.length > MAX_ZIP_ENTRIES) throw new Error('This archive contains too many images.');
  const uncompressedBytes = files.reduce((sum, entry) => sum + ((entry as unknown as { _data?: { uncompressedSize?: number } })._data?.uncompressedSize ?? 0), 0);
  if (uncompressedBytes > 700 * 1024 * 1024) throw new Error('Uncompressed archive is too large for browser reading.');
  const cache = new Map<number, string>();
  return {
    kind: 'comic', id: fileId(file), name: trimmedName(file.name), pageCount: files.length,
    getImage: async (i) => {
      if (i < 0 || i >= files.length) throw new Error('Page not found.');
      const hit = cache.get(i);
      if (hit) return hit;
      const data = await files[i].async('blob');
      const url = URL.createObjectURL(data);
      cache.set(i, url);
      // Keep only nearby, recently opened pages in memory.
      if (cache.size > 7) {
        const oldest = cache.keys().next().value;
        if (oldest !== undefined && oldest !== i) {
          URL.revokeObjectURL(cache.get(oldest)!);
          cache.delete(oldest);
        }
      }
      return url;
    },
    dispose: () => { for (const url of cache.values()) URL.revokeObjectURL(url); cache.clear(); },
  };
}

async function pageText(pdf: PDFDocumentProxy, index: number): Promise<string> {
  const page = await pdf.getPage(index + 1);
  const content = await page.getTextContent();
  // PDF text items can be individual words, not complete paragraphs.
  const lines: string[] = [];
  let line = '';
  for (const item of content.items) {
    if (!('str' in item)) continue;
    const value = item.str as string;
    const last = line.at(-1) ?? '';
    const first = value[0] ?? '';
    const needsSpace = line && value && !/\s/.test(last) && !/^[,.;:!?%)\]}]/.test(first) && !/[(\[{]$/.test(last);
    line += `${needsSpace ? ' ' : ''}${value}`;
    if (item.hasEOL) { lines.push(line.trim()); line = ''; }
  }
  if (line.trim()) lines.push(line.trim());
  return normalizeText(lines.join('\n'));
}

function pdfTextDocument(pdf: PDFDocumentProxy, file: File): TextDocument {
  const cache = new Map<number, string>();
  const fingerprint = pdf.fingerprints?.[0] || fileId(file);
  const getText = async (i: number) => {
    if (i < 0 || i >= pdf.numPages) throw new Error('Page not found.');
    if (cache.has(i)) return cache.get(i)!;
    const key = `${fingerprint}:${i}`;
    const stored = await readCachedText(key);
    if (stored !== null) { cache.set(i, stored); return stored; }
    const text = await pageText(pdf, i);
    cache.set(i, text);
    void writeCachedText(key, text);
    return text;
  };
  return {
    kind: 'text', id: fileId(file), name: trimmedName(file.name),
    chapters: Array.from({ length: pdf.numPages }, (_, i) => ({ title: `Page ${i + 1}` })),
    getText, dispose: () => { cache.clear(); void pdf.destroy(); },
  };
}

function pdfComicDocument(pdf: PDFDocumentProxy, file: File): ComicDocument {
  const cache = new Map<number, string>();
  const active = new Map<number, Promise<string>>();
  const getImage = async (i: number): Promise<string> => {
    if (i < 0 || i >= pdf.numPages) throw new Error('Page not found.');
    if (cache.has(i)) return cache.get(i)!;
    if (active.has(i)) return active.get(i)!;
    const work = (async () => {
      const page = await pdf.getPage(i + 1);
      const viewport = page.getViewport({ scale: Math.min(1.7, 1700 / page.getViewport({ scale: 1 }).width) });
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas is unavailable.');
      await page.render({ canvas, canvasContext: ctx, viewport }).promise;
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      canvas.width = 0; canvas.height = 0;
      if (!blob) throw new Error('Could not render the PDF page.');
      const url = URL.createObjectURL(blob);
      cache.set(i, url);
      if (cache.size > 5) {
        const oldest = cache.keys().next().value;
        if (oldest !== undefined && oldest !== i) {
          URL.revokeObjectURL(cache.get(oldest)!);
          cache.delete(oldest);
        }
      }
      return url;
    })();
    active.set(i, work);
    try { return await work; } finally { active.delete(i); }
  };
  return {
    kind: 'comic', id: fileId(file), name: trimmedName(file.name), pageCount: pdf.numPages,
    getImage,
    dispose: () => { for (const url of cache.values()) URL.revokeObjectURL(url); cache.clear(); void pdf.destroy(); },
  };
}

export async function loadDocuments(files: File[], pdfMode?: 'text' | 'comic'): Promise<LoadResult> {
  if (!files.length) throw new Error('Choose a file to read.');
  for (const file of files) assertSize(file);
  const file = files[0];
  const ext = file.name.toLowerCase();
  if (files.length > 1) {
    if (files.every(f => IMAGE.test(f.name))) return readImages(files);
    throw new Error('Select one book, or select multiple image files to create a comic.');
  }
  if (IMAGE.test(ext)) return readImages(files);
  if (ARCHIVE.test(ext)) return readComicZip(file);
  if (ext.endsWith('.txt')) return readTxt(file);
  if (ext.endsWith('.epub')) return readEpub(file);
  if (ext.endsWith('.pdf')) {
    const pdfjs = await import('pdfjs-dist');
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    if (pdfMode === 'comic') return pdfComicDocument(pdf, file);
    if (pdfMode === 'text') return pdfTextDocument(pdf, file);
    const inspect = [...new Set([0, Math.min(1, pdf.numPages - 1), Math.min(2, pdf.numPages - 1)])];
    // Skip image-only covers before suggesting that this is a scanned book.
    const samples = await Promise.all(inspect.map(i => pageText(pdf, i)));
    if (samples.some(text => text.replace(/\s/g, '').length >= 30)) return pdfTextDocument(pdf, file);
    const pending: PendingPdf = {
      kind: 'pending-pdf', name: file.name,
      asText: () => pdfTextDocument(pdf, file),
      asComic: () => pdfComicDocument(pdf, file),
      dispose: () => { void pdf.destroy(); },
    };
    return pending;
  }
  throw new Error('Unsupported file. Choose TXT, EPUB, PDF, CBZ, ZIP or images.');
}
