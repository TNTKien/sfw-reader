import type { ComicDocument } from '../types';

const CHAPTER_ID = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i;

export function parseSuicaodexChapter(input: string): string | null {
  const value = input.trim();
  if (CHAPTER_ID.test(value)) return value.toLowerCase();
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    if (url.hostname === 'sfw.suicaodex.com') {
      const match = url.pathname.match(/^\/read-scd\/([^/]+)\/?$/);
      return match && CHAPTER_ID.test(match[1]) ? match[1].toLowerCase() : null;
    }
    if (url.hostname !== 'suicaodex.com' && !url.hostname.endsWith('.suicaodex.com')) return null;
    const parts = url.pathname.split('/').filter(Boolean);
    for (let i = 0; i + 1 < parts.length; i++) {
      if ((parts[i].toLowerCase() === 'chapter' || parts[i].toLowerCase() === 'chapters') && CHAPTER_ID.test(parts[i + 1])) {
        return parts[i + 1].toLowerCase();
      }
    }
  } catch { /* Not a URL or ID. */ }
  return null;
}

export function routeChapterId(pathname: string): string | null {
  const match = pathname.match(/^\/read-scd\/([^/]+)\/?$/i);
  if (!match) return null;
  try { return decodeURIComponent(match[1]); } catch { return match[1]; }
}

type Page = {
  position: number;
  url: string;
  optimizedUrl?: string | null;
  replicaUrl?: string | null;
};
type ChapterPayload = {
  id: string;
  number: string | null;
  volume: string | null;
  title: string | null;
  manga: { title: string; id: string };
  pages: Page[];
};

// Only download images as they become visible or are prefetched by the existing comic reader.
function imageCandidates(page: Page): string[] {
  return [...new Set([page.replicaUrl, page.optimizedUrl, page.url]
    .filter((url): url is string => typeof url === 'string' && url.startsWith('https://')))];
}

function firstAvailableImage(page: Page, signal?: AbortSignal): Promise<string> {
  const candidates = imageCandidates(page);
  if (!candidates.length) return Promise.reject(new Error('No valid image URL for this page.'));
  return new Promise((resolve, reject) => {
    let cursor = 0, timer: ReturnType<typeof setTimeout> | undefined;
    let image: HTMLImageElement | undefined;
    let finished = false;
    const clean = () => {
      if (timer) clearTimeout(timer);
      if (image) { image.onload = null; image.onerror = null; }
      signal?.removeEventListener('abort', aborted);
    };
    const aborted = () => {
      if (finished) return;
      finished = true; clean();
      reject(new DOMException('Image request cancelled', 'AbortError'));
    };
    const tryNext = () => {
      if (finished) return;
      if (timer) clearTimeout(timer);
      if (image) { image.onload = null; image.onerror = null; }
      if (signal?.aborted) return aborted();
      if (cursor >= candidates.length) {
        finished = true; clean(); reject(new Error('Unable to load image from Suicaodex.'));
        return;
      }
      const url = candidates[cursor++];
      image = new Image();
      image.onload = () => { if (!finished) { finished = true; clean(); resolve(url); } };
      image.onerror = tryNext;
      timer = setTimeout(tryNext, 10000);
      image.src = url;
    };
    signal?.addEventListener('abort', aborted, { once: true });
    tryNext();
  });
}

function createChapterDocument(payload: ChapterPayload): ComicDocument {
  const pages = [...payload.pages].sort((a, b) => a.position - b.position);
  const chapterNumber = payload.number ? 'Chapter ' + payload.number : 'Chapter';
  const chapterTitle = payload.title ? chapterNumber + ': ' + payload.title : chapterNumber;
  const inFlight = new Map<number, Promise<string>>();
  const cache = new Map<number, string>();
  const active = new Set<AbortController>();
  let disposed = false;

  return {
    id: 'suicaodex:' + payload.id,
    kind: 'comic',
    name: payload.manga.title + ' — ' + chapterTitle,
    pageCount: pages.length,
    getImage: async index => {
      if (disposed) throw new Error('Chapter is closed.');
      if (!Number.isInteger(index) || index < 0 || index >= pages.length) throw new Error('Page not found.');
      if (cache.has(index)) return cache.get(index)!;
      const previous = inFlight.get(index);
      if (previous) return previous;
      const controller = new AbortController();
      active.add(controller);
      const promise = firstAvailableImage(pages[index], controller.signal).then(url => {
        if (!disposed) cache.set(index, url);
        return url;
      }).finally(() => {
        active.delete(controller);
        inFlight.delete(index);
      });
      inFlight.set(index, promise);
      return promise;
    },
    dispose: () => {
      disposed = true;
      for (const controller of active) controller.abort();
      active.clear(); inFlight.clear(); cache.clear();
    },
  };
}

export async function loadSuicaodexChapter(id: string, signal?: AbortSignal): Promise<ComicDocument> {
  if (!CHAPTER_ID.test(id)) throw new Error('Invalid Suicaodex chapter ID. Enter a chapter link or UUID.');
  // Fetch directly from the browser. Suicaodex must allow this site's Origin via CORS.
  let response: Response;
  try {
    response = await fetch('https://redive.suicaodex.com/v1/chapters/' + encodeURIComponent(id), {
      method: 'GET', headers: { Accept: 'application/json' }, signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error('Could not contact Suicaodex. Check your connection and ensure the API allows this site through CORS.');
  }
  if (response.status === 404) throw new Error('Chapter not found, unpublished, or unavailable.');
  if (!response.ok) throw new Error(response.status === 429 ? 'Suicaodex is rate limiting requests. Try again later.' :
    'Unable to retrieve this chapter (HTTP ' + response.status + ').');
  const value: unknown = await response.json();
  if (!value || typeof value !== 'object') throw new Error('Invalid chapter response.');
  const data = value as Partial<ChapterPayload>;
  if (typeof data.id !== 'string' || !data.manga || typeof data.manga.title !== 'string' || !Array.isArray(data.pages)) {
    throw new Error('The API returned an unexpected chapter format.');
  }
  if (!data.pages.length) throw new Error('This chapter has no available image pages.');
  if (data.pages.length > 500 || data.pages.some(page =>
    !page || !Number.isInteger(page.position) || typeof page.url !== 'string')) {
    throw new Error('This chapter has invalid page information.');
  }
  return createChapterDocument(data as ChapterPayload);
}
