import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, ArrowDownRight, ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ChevronDown, ChevronUp, CircleHelp, Code2, FileArchive, FileImage, FileText, FolderOpen, Github, Grid2X2, HardDrive, Image, Layers, LockKeyhole, Monitor, Plus, Presentation, ShieldCheck, Sparkles, UploadCloud, X } from 'lucide-react';
import ComicApps from './components/ComicApps';
import TextApps from './components/TextApps';
import HelpDialog from './components/HelpDialog';
import { getStoredTerminalProfile, updateBrowserAppearance, type TerminalProfile } from './lib/browserAppearance';
import { loadSuicaodexChapter, parseSuicaodexChapter, routeChapterId } from './lib/suicaodex';
import { demoComic, demoText } from './lib/demo';
import type { ComicView, PendingPdf, ReaderDocument, TextView, View } from './types';

const comicViews: { id: ComicView; title: string; desc: string }[] = [
  { id: 'photoshop', title: 'Photoshop', desc: 'Pixel-perfect reading' },
  { id: 'powerpoint', title: 'PowerPoint', desc: 'Slide by slide' },
  { id: 'canva', title: 'Canva', desc: 'A new kind of design' },
];
const textViews: { id: TextView; title: string; desc: string }[] = [
  { id: 'excel', title: 'Excel', desc: 'Stories in cells' },
  { id: 'code', title: 'VS Code', desc: 'Readable source' },
  { id: 'terminal', title: 'Terminal', desc: 'Warp · Ghostty · Windows Terminal' },
];

function getStoredPosition(doc: ReaderDocument): { index: number; view?: View } {
  try {
    const value = JSON.parse(localStorage.getItem(`sfw-position:${doc.id}`) || 'null');
    if (value && Number.isInteger(value.index) && value.index >= 0) return value;
  } catch { /* private browsing can disable storage */ }
  return { index: 0 };
}

function Landing({ onFiles, onDemo, onHelp, onSuicaodex, busy, error }: {
  onFiles: (files: File[]) => void;
  onDemo: (kind: 'text' | 'comic') => void;
  onHelp: () => void;
  onSuicaodex: (value: string) => string | null;
  busy: boolean;
  error: string | null;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [chapterLink, setChapterLink] = useState('');
  const [chapterLinkError, setChapterLinkError] = useState<string | null>(null);
  return <div className="landing">
    <header className="landing-top"><div className="brand"><span className="brand-mark"><BookOpen size={18}/></span><div>SFW <strong>READER</strong></div><span className="brand-version">/ BETA 0.1</span></div><nav className="landing-nav"><button type="button" className="landing-help" onClick={onHelp} title="How to use SFW Reader (F1 / ?)"><CircleHelp size={17}/> Guide <kbd>F1</kbd></button><span className="landing-private"><span/> Local files stay on your device</span><a href="https://github.com/TNTKien/sfw-reader" target="_blank" rel="noreferrer"><Github size={18}/> GitHub <ArrowDownRight size={15}/></a></nav></header>
    <main className="landing-main"><div className="eyebrow"><span className="eyebrow-line"/> A DIFFERENT KIND OF READING DESK <span className="eyebrow-arrow">↗</span></div><div className="hero-grid"><section className="hero-copy"><h1>A story in<br/><em>disguise.</em></h1><p>Your favorite stories, dressed up as familiar software. Open a book, pick a workspace, and enjoy reading in a whole new window.</p><div className="hero-pill-row"><span><ShieldCheck size={15}/> 100% browser-side</span><span><Sparkles size={15}/> Zero setup</span></div><div className="hero-micro"><span className="hero-micro-line"/><span>MADE FOR CURIOUS READERS, NOT FOR GETTING CAUGHT.</span></div></section><section className={`upload-card ${dragging ? 'dragging' : ''}`} onDragEnter={event=>{event.preventDefault();setDragging(true);}} onDragOver={event=>event.preventDefault()} onDragLeave={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node))setDragging(false);}} onDrop={event=>{event.preventDefault();setDragging(false);if(event.dataTransfer.files.length)onFiles(Array.from(event.dataTransfer.files));}}>
      <div className="upload-card-top"><span>01 / YOUR NEXT READ</span><span className="upload-card-dots"><i/><i/><i/></span></div><div className="upload-card-center"><div className="upload-art"><div className="upload-art-inner"><FileText size={29}/><span>+</span></div><div className="upload-art-circle"/></div><h2>Drop a story<br/>right here.</h2><p>Drag a file into this window or choose one from your device. Nothing is uploaded.</p><input hidden type="file" ref={input} multiple accept=".txt,.epub,.pdf,.cbz,.zip,.jpg,.jpeg,.png,.webp,.gif,.avif,image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={event=>{if(event.target.files?.length)onFiles(Array.from(event.target.files));event.target.value='';}}/><button disabled={busy} onClick={()=>input.current?.click()} className="choose-file"><FolderOpen size={17}/>{busy?'Opening your book…':'Choose a file'}<ArrowRight size={18}/></button>{error && <div className="upload-error"><AlertCircle size={15}/>{error}</div>}</div><div className="upload-card-bottom"><span>TXT · EPUB · PDF · CBZ · ZIP · IMAGES</span><span>MAX 350 MB / FILE</span></div>
    </section></div>
    <form className="scd-link-card" onSubmit={event => {
      event.preventDefault();
      const validation = onSuicaodex(chapterLink);
      setChapterLinkError(validation);
    }}>
      <div className="scd-link-intro"><div className="scd-link-mark"><BookOpen size={19}/></div><div><span className="scd-link-eyebrow">READ FROM SUICAODEX</span><h3>Already have a chapter link?</h3><p>Paste a Suicaodex chapter URL or chapter ID and read it in a comic workspace.</p></div></div>
      <div className="scd-link-form"><label className="scd-link-input"><span>CHAPTER LINK</span><input type="text" value={chapterLink} onChange={e => {setChapterLink(e.target.value);setChapterLinkError(null);}} placeholder="https://suicaodex.com/chapter/…" aria-label="Suicaodex chapter link or UUID" autoComplete="off"/></label><button type="submit" disabled={!chapterLink.trim()}><span>Read chapter</span><ArrowRight size={17}/></button></div>
      {chapterLinkError && <div role="alert" className="scd-link-error">{chapterLinkError}</div>}
    </form>
    <div className="workspace-line"><div><span className="section-numeral">02 /</span> PICK YOUR COVER STORY</div><span>ONE ENGINE, SIX FAMILIAR WORKSPACES <ArrowDownRight size={17}/></span></div><div className="mode-preview"><article className="mode-card text-mode"><div className="mode-card-top"><div className="mode-icons"><span className="mode-icon excel-mini">X</span><span className="mode-icon code-mini">⌘</span></div><span>FOR WRITTEN STORIES</span></div><div className="mode-illustration mode-text-illustration"><div className="mini-window-top"><i/><i/><i/><b>Quarterly_report.xlsx</b></div><div className="mini-spreadsheet"><div>A</div><div>B</div><div>C</div><div>1</div><div className="mini-active">The story begins somewhere else…</div><div/><div>2</div><div>Another line appears quietly.</div><div/><div>3</div><div>This could be any spreadsheet.</div><div/></div></div><h3>Words at work.</h3><p>Every sentence becomes a row, a line of code, or terminal output. Your call.</p><button onClick={()=>onDemo('text')}>Try the text demo <ArrowRight size={18}/></button></article><article className="mode-card comic-mode"><div className="mode-card-top"><div className="mode-icons"><span className="mode-icon photoshop-mini">Ps</span><span className="mode-icon power-mini">P</span><span className="mode-icon canva-mini">C</span></div><span>FOR VISUAL STORIES</span></div><div className="mode-illustration mode-visual-illustration"><div className="mini-ps-header"><span>Ps</span> File　 Edit　 Image　 Layer　 Type　 View</div><div className="mini-ps-body"><div className="mini-ps-tool">✥<br/>□<br/>⌖<br/>T<br/>◈</div><img src="/demo-comic.svg" alt="Original sample comic illustration"/><div className="mini-ps-layers"><b>Layers</b><span>☷</span><span>◉ Page 01</span><span>◉ Layer 1</span><span>◉ Background</span></div></div></div><h3>Art, in progress.</h3><p>Your manga pages, reimagined inside the creative tools you know.</p><button onClick={()=>onDemo('comic')}>Try the comic demo <ArrowRight size={18}/></button></article></div></main><footer className="landing-footer"><span>© {new Date().getFullYear()} SFW READER · A PLAYFUL EXPERIMENT</span><span>NOT AFFILIATED WITH ADOBE, MICROSOFT, CANVA OR VS CODE.</span><a href="https://github.com/TNTKien/sfw-reader" target="_blank" rel="noreferrer">OPEN SOURCE ↗</a></footer>
  </div>;
}

function ScanDialog({ pending, choose, dismiss }: { pending: PendingPdf; choose: (mode: 'text' | 'comic') => void; dismiss: () => void }) {
  return <div className="dialog-backdrop"><section className="scan-dialog" role="dialog" aria-modal="true" aria-labelledby="scan-heading"><button className="dialog-close" onClick={dismiss} aria-label="Cancel"><X size={17}/></button><div className="scan-icon"><FileImage size={29}/></div><span className="dialog-eyebrow">NO OCR. NO WAITING.</span><h2 id="scan-heading">This looks like<br/>a scanned PDF.</h2><p>We couldn't find enough selectable text in the first pages of <strong>{pending.name}</strong>. SFW Reader doesn't OCR books, but you can still read every page as a comic.</p><button className="dialog-primary" onClick={()=>choose('comic')}><Image size={18}/> Open as a comic <ArrowRight size={18}/></button><button className="dialog-secondary" onClick={()=>choose('text')}>Try text mode anyway</button><small>Text mode may show empty pages if the PDF is image-only.</small></section></div>;
}

export default function App() {
  const [book, setBook] = useState<ReaderDocument | null>(null);
  const [remoteChapterId, setRemoteChapterId] = useState<string | null>(() => routeChapterId(window.location.pathname));
  const [remoteLoading, setRemoteLoading] = useState(() => routeChapterId(window.location.pathname) !== null);
  const [remoteRetry, setRemoteRetry] = useState(0);
  const bookRef = useRef<ReaderDocument | null>(null);
  const [pending, setPending] = useState<PendingPdf | null>(null);
  const [view, setView] = useState<View>('photoshop');
  const [headerVisible, setHeaderVisible] = useState(true);
  const [helpOpen, setHelpOpen] = useState(false);
  const [terminalProfile, setTerminalProfile] = useState<TerminalProfile>(getStoredTerminalProfile);
  const closeHelp = useCallback(() => setHelpOpen(false), []);
  const [page, setPage] = useState(0);
  const [zoom, setZoom] = useState(80);
  const [mode, setMode] = useState<'sentence' | 'paragraph'>('sentence');
  const [image, setImage] = useState<string | null>(null);
  const [raw, setRaw] = useState('');
  const [rendering, setRendering] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const lastFiles = useRef<File[] | null>(null);

  const goHome = useCallback(() => {
    if (window.location.pathname !== '/') window.history.pushState({}, '', '/');
    setRemoteChapterId(null);
    setRemoteLoading(false);
    setError(null);
  }, []);

  const openSuicaodexLink = useCallback((input: string): string | null => {
    const id = parseSuicaodexChapter(input);
    if (!id) return 'Enter a valid Suicaodex chapter link or chapter UUID.';
    window.history.pushState({}, '', '/read-scd/' + encodeURIComponent(id));
    setRemoteChapterId(id);
    setRemoteLoading(true);
    setBook(null);
    setError(null);
    return null;
  }, []);

  const applyBook = useCallback((next: ReaderDocument) => {
    bookRef.current?.dispose();
    bookRef.current = next;
    const saved = getStoredPosition(next);
    const limit = next.kind === 'comic' ? next.pageCount : next.chapters.length;
    setPage(Math.min(saved.index, limit - 1));
    setView(next.kind === 'comic' && ['photoshop','powerpoint','canva'].includes(saved.view ?? '')
      ? saved.view as ComicView
      : next.kind === 'text' && ['excel','code','terminal'].includes(saved.view ?? '')
        ? saved.view as TextView : next.kind === 'comic' ? 'photoshop' : 'excel');
    setZoom(80);
    setBook(next);
    setImage(null);
    setRaw('');
    setError(null);
  }, []);

  const openFiles = useCallback(async (files: File[]) => {
    if (!files.length) return;
    setError(null);
    setBusy(true);
    try {
      if (pending) pending.dispose();
      setPending(null);
      const { loadDocuments } = await import('./lib/documents');
      const result = await loadDocuments(files);
      lastFiles.current = files;
      goHome();
      if (result.kind === 'pending-pdf') setPending(result);
      else applyBook(result);
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not read this book.'); }
    finally { setBusy(false); }
  }, [applyBook, pending, goHome]);

  const reopenAsComic = async () => {
    if (!lastFiles.current?.[0]?.name.toLowerCase().endsWith('.pdf')) return;
    setBusy(true);
    try { const { loadDocuments } = await import('./lib/documents'); const result = await loadDocuments(lastFiles.current, 'comic'); if (result.kind === 'comic') applyBook(result); }
    catch(e) { setError(e instanceof Error ? e.message : 'Could not open PDF as comic.'); }
    finally { setBusy(false); }
  };
  const chooseScan = (type: 'text' | 'comic') => {
    if (!pending) return;
    const result = type === 'comic' ? pending.asComic() : pending.asText();
    setPending(null);
    applyBook(result);
  };
  const close = useCallback(() => {
    bookRef.current?.dispose();
    bookRef.current = null;
    setBook(null);
    goHome();
    setRaw(''); setImage(null);
  }, [goHome]);

  // Deep-linked Suicaodex chapters share the existing ComicDocument reader engine.
  useEffect(() => {
    if (!remoteChapterId) return;
    const controller = new AbortController();
    setRemoteLoading(true);
    setError(null);
    bookRef.current?.dispose();
    bookRef.current = null;
    setBook(null);
    lastFiles.current = null;
    void loadSuicaodexChapter(remoteChapterId, controller.signal).then(next => {
      if (!controller.signal.aborted) {
        applyBook(next);
        setRemoteLoading(false);
      } else next.dispose();
    }).catch(error => {
      if (!controller.signal.aborted) {
        setRemoteLoading(false);
        setError(error instanceof Error ? error.message : 'Could not load this chapter.');
      }
    });
    return () => controller.abort();
  }, [remoteChapterId, remoteRetry, applyBook]);

  useEffect(() => {
    const onPopState = () => {
      const id = routeChapterId(window.location.pathname);
      setRemoteChapterId(id);
      if (!id) {
        bookRef.current?.dispose();
        bookRef.current = null;
        setBook(null);
        setError(null);
        setRemoteLoading(false);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Keep the browser tab's title, favicon and theme synchronized with the active workspace.
  useEffect(() => {
    updateBrowserAppearance(book ? view : 'home', book?.name, terminalProfile, page);
  }, [book, view, terminalProfile, page]);

  // Global help is available on the home page and with the reader toolbar hidden.
  useEffect(() => {
    const onHelpKey = (event: KeyboardEvent) => {
      if (pending || event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target instanceof HTMLElement ? event.target : null;
      const editing = target && (
        ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName) ||
        target.isContentEditable || target.closest('[contenteditable="true"], [role="textbox"], [role="menu"], .menu-bar, [role="dialog"]')
      );
      if (event.key === 'F1' || (event.key === '?' && !editing)) {
        event.preventDefault();
        setHelpOpen(true);
      }
    };
    window.addEventListener('keydown', onHelpKey);
    return () => window.removeEventListener('keydown', onHelpKey);
  }, [pending]);

  useEffect(() => () => { bookRef.current?.dispose(); }, []);
  useEffect(() => {
    if (!book) return;
    let cancelled = false;
    setRendering(true); setError(null); setImage(null); setRaw('');
    (async () => {
      try {
        if (book.kind === 'comic') {
          const url = await book.getImage(page);
          if (!cancelled) { setImage(url); setRendering(false); }
          // Prefetch one page; never hold the entire book in memory.
          if (page + 1 < book.pageCount) void book.getImage(page + 1).catch(() => {});
        } else {
          const text = await book.getText(page);
          if (!cancelled) { setRaw(text); setRendering(false); }
          if (page + 1 < book.chapters.length) void book.getText(page + 1).catch(() => {});
        }
      } catch (e) {
        if (!cancelled) { setRendering(false); setError(e instanceof Error ? e.message : 'Could not render this page.'); }
      }
    })();
    return () => { cancelled = true; };
  }, [book, page]);
  useEffect(() => {
    if (!book) return;
    try { localStorage.setItem(`sfw-position:${book.id}`, JSON.stringify({ index: page, view })); } catch { /* optional */ }
  }, [book, page, view]);
  useEffect(() => {
    if (!book || pending || helpOpen) return;
    const onKey = (event: KeyboardEvent) => {
      const element = event.target as HTMLElement | null;
      // Keep native editing and mock application menu keyboard interactions intact.
      if (element && (
        ['INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName) ||
        element.isContentEditable ||
        element.closest('[contenteditable="true"], [role="textbox"], .menu-bar, [role="menu"], [role="dialog"]')
      )) return;

      if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'o') {
        event.preventDefault();
        fileInput.current?.click();
        return;
      }
      if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;

      if (event.key.toLowerCase() === 'h') {
        if (event.repeat) return; // Holding H should not flash the header.
        event.preventDefault();
        setHeaderVisible(visible => !visible);
        return;
      }

      // In comic mode, arrows must still work after clicking a workspace or toolbar button.
      // Keep the existing text-reader behavior for focused buttons.
      if (book.kind === 'text' && element?.tagName === 'BUTTON') return;
      if (event.key === 'ArrowRight' || event.key === 'PageDown') {
        event.preventDefault();
        setPage(p => Math.min(p + 1, book.kind === 'comic' ? book.pageCount - 1 : book.chapters.length - 1));
      } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault();
        setPage(p => Math.max(0, p - 1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [book, pending, helpOpen]);

  const compatible = useMemo(() => book?.kind === 'comic' ? comicViews : textViews, [book]);
  return <>
    {!book && remoteChapterId ? <div className="scd-route-page">
      <div className="scd-route-panel"><span className="scd-route-kicker">SUICAODEX / CHAPTER</span>
        <div className="scd-route-symbol"><BookOpen size={29}/></div>
        <h1>{remoteLoading ? 'Opening chapter…' : 'Could not open chapter'}</h1>
        <p>{remoteLoading ? 'Retrieving chapter pages from Suicaodex. Your local files are not uploaded.' : error ?? 'This chapter is unavailable.'}</p>
        {!remoteLoading && <div className="scd-route-actions"><button onClick={() => setRemoteRetry(current => current + 1)} className="scd-route-retry" type="button">Try again</button><button onClick={goHome} type="button">Back to home</button></div>}
        {remoteLoading && <div className="scd-route-progress"/>}
      </div>
    </div> : !book ? <Landing onFiles={openFiles} onDemo={type => { lastFiles.current = null; applyBook(type === 'comic' ? demoComic() : demoText()); }} onHelp={() => setHelpOpen(true)} onSuicaodex={openSuicaodexLink} busy={busy} error={error}/> :
      <div className="reader-page">
      <input hidden type="file" ref={fileInput} multiple accept=".txt,.epub,.pdf,.cbz,.zip,.jpg,.jpeg,.png,.webp,.gif,.avif" onChange={event=>{if(event.target.files?.length)void openFiles(Array.from(event.target.files));event.target.value='';}}/>
      {headerVisible ? <header className="reader-toolbar"><button className="reader-home" onClick={close} title="Close reader"><span className="reader-home-badge"><BookOpen size={17}/></span><span>SFW <b>READER</b></span></button><div className="reader-toolbar-divider"/><span className="reader-bookname" title={book.name}>{book.name}</span><div className="reader-mode-switch" role="group" aria-label="Choose reading workspace">{compatible.map(item => <button key={item.id} className={view === item.id ? 'current' : ''} onClick={() => setView(item.id as View)} title={item.desc}>{item.title}</button>)}</div>{book.kind === 'text' && lastFiles.current?.[0]?.name.toLowerCase().endsWith('.pdf') && <button className="reader-pdf-comic" onClick={()=>void reopenAsComic()}>Read as comic</button>}<span className="reader-local"><span/> {book.id.startsWith("suicaodex:") ? "SCD CHAPTER" : "LOCAL ONLY"}</span><button className="reader-open" onClick={()=>fileInput.current?.click()} disabled={busy}><Plus size={16}/> Open</button><button className="reader-help" type="button" title="Help (F1 / ?)" aria-label="Open guide" onClick={() => setHelpOpen(true)}><CircleHelp size={17}/></button><button className="reader-header-hide" type="button" title="Hide reader header (H)" aria-label="Hide reader header (H)" onClick={() => setHeaderVisible(false)}><ChevronUp size={16}/><kbd>H</kbd></button><button className="reader-back" title="Back to library" onClick={close}><X size={17}/></button></header> : <button type="button" className="reader-header-show" title="Show reader header (H)" aria-label="Show reader header (H)" onClick={() => setHeaderVisible(true)}><ChevronDown size={16}/></button>}
      {book.kind === 'comic' ? <ComicApps name={book.name} index={page} count={book.pageCount} image={image} getImage={book.getImage} zoom={zoom} setZoom={setZoom} onPage={setPage} view={view as ComicView} setView={setView} openFile={()=>fileInput.current?.click()} close={close}/> : <TextApps name={book.name} raw={raw} loading={rendering} index={page} titles={book.chapters} onPage={setPage} mode={mode} onMode={setMode} view={view as TextView} setView={setView} onTerminalProfileChange={setTerminalProfile} openFile={()=>fileInput.current?.click()} close={close}/>}
      {error && <div className="reader-error"><AlertCircle size={17}/>{error}<button onClick={()=>setError(null)}><X size={15}/></button></div>}
      {rendering && book.kind === 'text' && <div className="reader-toast">Loading {book.chapters[page]?.title}…</div>}
      </div>}
    {pending && <ScanDialog pending={pending} choose={chooseScan} dismiss={()=>{pending.dispose();setPending(null);}}/>}
    {helpOpen && !pending && <HelpDialog onClose={closeHelp}/>}
  </>;
}
