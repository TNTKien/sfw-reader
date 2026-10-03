import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { BookOpen, ChevronLeft, ChevronRight, Command, FolderOpen, HardDrive, Plus, Terminal as TerminalIcon } from 'lucide-react';
import { MenuBar, WindowControls } from './Chrome';
import type { TextProps } from './TextApps';
import { getStoredTerminalProfile, type TerminalProfile } from '../lib/browserAppearance';

type TerminalSkin = TerminalProfile;

const skins: { id: TerminalSkin; label: string; caption: string }[] = [
  { id: 'warp', label: 'Warp', caption: 'Blocks & sessions' },
  { id: 'ghostty', label: 'Ghostty', caption: 'Minimal terminal' },
  { id: 'windows', label: 'Windows Terminal', caption: 'PowerShell session' },
];


function Prompt({ skin }: { skin: TerminalSkin }) {
  if (skin === 'ghostty') return <span className="term-starship-prompt"><span className="term-starship-path">~/books</span><span className="term-starship-branch">git:main</span><span className="term-starship-arrow">❯</span></span>;
  if (skin === 'windows') return <span className="term-omp-prompt"><span className="term-omp-os">PS</span><span className="term-omp-path">~/books</span><span className="term-omp-branch">git:main</span><span className="term-omp-arrow">❯</span></span>;
  return <span className="term-prompt">➜  ~/books</span>;
}

export default function TerminalApps({ props, rows }: { props: TextProps; rows: string[] }) {
  const { name, index, titles, onPage, mode, onMode, openFile, close, setView, loading, onTerminalProfileChange } = props;
  const [skin, setSkin] = useState<TerminalSkin>(getStoredTerminalProfile);
  const [command, setCommand] = useState('');
  const [message, setMessage] = useState('');
  const [showOutput, setShowOutput] = useState(true);
  const [history, setHistory] = useState('');
  const scrollElement = useRef<HTMLDivElement>(null);
  const commandField = useRef<HTMLInputElement>(null);
  const chapterTitle = titles[index]?.title ?? 'Current page';
  const fileName = name.replace(/\.[^.]+$/, '').replace(/\s+/g, '_') + '.txt';

  const virtualizer = useVirtualizer({
    count: showOutput ? rows.length : 0,
    getScrollElement: () => scrollElement.current,
    estimateSize: () => mode === 'paragraph' ? 72 : 46,
    overscan: 10,
  });

  useEffect(() => {
    try { localStorage.setItem('sfw-terminal-skin', skin); } catch { /* Optional preference. */ }
    onTerminalProfileChange?.(skin);
  }, [skin, onTerminalProfileChange]);

  useEffect(() => {
    setMessage('');
    setHistory('');
    setShowOutput(true);
    scrollElement.current?.scrollTo({ top: 0 });
  }, [index]);

  useEffect(() => {
    scrollElement.current?.scrollTo({ top: 0 });
  }, [mode]);

  const previous = () => onPage(Math.max(0, index - 1));
  const next = () => onPage(Math.min(titles.length - 1, index + 1));

  // This is intentionally a small, allowlisted UI simulation. No shell is ever run.
  const runCommand = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const entered = command.trim();
    if (!entered) return;
    setHistory(entered);
    setCommand('');
    const [instruction, option] = entered.toLowerCase().split(/\s+/, 2);

    if (instruction === 'help') {
      setMessage('Local reader commands: help, ls, pwd, cat, clear, next, prev, theme [warp|ghostty|windows], mode [sentence|paragraph], view [excel|code].');
    } else if (instruction === 'ls') {
      setMessage(titles.slice(0, 15).map((chapter, n) => String(n + 1).padStart(2, '0') + '  ' + chapter.title).join('\n') + (titles.length > 15 ? '\n…' : ''));
    } else if (instruction === 'pwd') {
      setMessage('~/sfw-reader/books');
    } else if (instruction === 'cat' || instruction === 'less') {
      setShowOutput(true);
      setMessage('');
      scrollElement.current?.scrollTo({ top: 0 });
    } else if (instruction === 'clear') {
      setShowOutput(false);
      setMessage('Output hidden. Type cat to read again.');
    } else if (instruction === 'next' || instruction === 'prev') {
      const destination = instruction === 'next' ? index + 1 : index - 1;
      if (destination < 0 || destination >= titles.length) setMessage('Already at the ' + (instruction === 'next' ? 'last' : 'first') + ' chapter.');
      else onPage(destination);
    } else if (instruction === 'theme') {
      if (option === 'warp' || option === 'ghostty' || option === 'windows') {
        setSkin(option);
        setMessage('Appearance updated: ' + skins.find(item => item.id === option)?.label);
      } else setMessage('Usage: theme warp | ghostty | windows');
    } else if (instruction === 'mode') {
      if (option === 'sentence' || option === 'paragraph') {
        onMode(option);
        setMessage('Line grouping: ' + option);
      } else setMessage('Usage: mode sentence | paragraph');
    } else if (instruction === 'view') {
      if (option === 'excel' || option === 'code') setView(option);
      else setMessage('Usage: view excel | code');
    } else {
      setMessage('Unknown reader command. Type help for available commands.');
    }
  };

  const menus = [
    { label: 'File', items: [
      { label: 'Open local book…', shortcut: 'Ctrl+O', action: openFile },
      { label: 'Previous chapter', disabled: index === 0, action: previous },
      { label: 'Next chapter', disabled: index >= titles.length - 1, action: next },
      { label: '', divider: true }, { label: 'Close reader', action: close },
    ] },
    { label: 'View', items: [
      { label: 'Warp', checked: skin === 'warp', action: () => setSkin('warp') },
      { label: 'Ghostty', checked: skin === 'ghostty', action: () => setSkin('ghostty') },
      { label: 'Windows Terminal', checked: skin === 'windows', action: () => setSkin('windows') },
      { label: '', divider: true },
      { label: 'Excel', action: () => setView('excel') },
      { label: 'VS Code', action: () => setView('code') },
    ] },
    { label: 'Help', items: [{ label: 'Available commands', action: () => { setMessage('Try: help, ls, cat, clear, next, prev, theme, mode, view.'); commandField.current?.focus(); } }] },
  ];

  return <div className={'term app-fill term--' + skin}>
    <div className="term-titlebar">
      {skin === 'windows' ?
        <div className="term-win-tab"><TerminalIcon size={15}/><span>PowerShell</span><span aria-hidden="true">×</span><span className="term-win-add"><Plus size={14}/><span className="term-win-chevron">⌄</span></span></div> :
        <div className="term-mac-title"><div className="term-traffic" aria-hidden="true"><i/><i/><i/></div>{skin === 'warp' ? <strong>warp <span>›</span> reader</strong> : <strong>ghostty</strong>}</div>}
      {skin === 'windows' && <div className="term-win-menu"><MenuBar entries={menus}/></div>}
      <div className="term-title-spacer"/>
      {skin === 'warp' && <span className="term-native-badge">zsh　⌄</span>}
      {skin === 'windows' && <WindowControls onClose={close}/>}
    </div>
    <div className="term-menubar">
      {skin === 'warp' && <span className="term-menu-brand"><Command size={15}/> WARP</span>}
      {skin === 'ghostty' && <span className="term-menu-brand"><TerminalIcon size={15}/> ~/books</span>}
      {skin === 'windows' && <span className="term-menu-brand"><HardDrive size={14}/> Windows PowerShell</span>}
      <MenuBar entries={menus} className="term-mock-menus"/>
      <span className="term-menubar-right"><span className="term-live-dot"/> LOCAL SESSION</span>
    </div>
    <div className="term-body">
      {skin === 'warp' && <aside className="term-warp-sidebar">
        <div className="term-side-heading">WORKSPACES <Plus size={14}/></div>
        <div className="term-side-selected"><TerminalIcon size={15}/> Personal</div>
        <div className="term-side-heading">OPEN TABS</div>
        <div className="term-side-file"><BookOpen size={14}/> {fileName}</div>
        <div className="term-side-bottom"><HardDrive size={14}/> Local workspace</div>
      </aside>}
      <div className="term-workspace">
        {skin === 'warp' ?
          <div className="term-session-heading"><span><TerminalIcon size={15}/> reader@localhost</span><span>{chapterTitle}</span></div> :
          skin === 'ghostty' ?
            <div className="term-ghostty-heading"><span className="term-ghostty-user">reader@localhost</span><span> ~/books / {chapterTitle}</span><span className="term-ghostty-shell">⌘⌥</span></div> :
            <div className="term-win-heading">Windows PowerShell <span> — {chapterTitle}</span></div>}
        <div className="term-scroll" ref={scrollElement} tabIndex={0} role="region" aria-label="Story content">
          <div className="term-command-echo">
            <Prompt skin={skin}/>
            <span className="term-command"> {skin === 'windows' ? 'Get-Content ' : 'cat '}{fileName}</span>
          </div>
          {skin === 'warp' && <div className="term-warp-command-caption"><span>✓</span> OUTPUT <span className="term-command-duration">· {chapterTitle}</span></div>}
          {skin === 'ghostty' && <div className="term-ghostty-banner"># {chapterTitle}</div>}
          {showOutput && (loading ? <div className="term-feedback">Reading local document…</div> :
            rows.length ? <div className="term-virtual" style={{height: virtualizer.getTotalSize(), position: 'relative'}}>
              {virtualizer.getVirtualItems().map(item => <div
                key={item.key}
                data-index={item.index}
                ref={virtualizer.measureElement}
                className="term-story-line"
                style={{position: 'absolute', left: 0, top: 0, width: '100%', transform: 'translateY(' + item.start + 'px)'}}>
                {rows[item.index]}
              </div>)}
            </div> : <div className="term-feedback">No extractable text. Scanned PDFs should be opened as comics.</div>
          )}
          {history && <div className="term-command-history"><span className="term-prompt">{skin === 'windows' ? 'PS >' : '➜'}</span> {history}</div>}
          {message && <div className="term-feedback term-result" role="status">{message}</div>}
        </div>
        <form className="term-inputbar" onSubmit={runCommand}>
          <label htmlFor="sfw-terminal-command"><Prompt skin={skin}/></label>
          <input ref={commandField} id="sfw-terminal-command" value={command} onChange={event => setCommand(event.target.value)} autoComplete="off" spellCheck={false} placeholder="help · cat · next · theme…" aria-label="Reader command"/>
          
        </form>
      </div>
    </div>
    <footer className="term-footer">
      <div className="term-footer-left"><span className="term-footer-indicator"/><span>{skin === 'windows' ? 'PowerShell' : skin === 'warp' ? 'zsh' : 'fish'}</span><span className="term-footer-muted">UTF-8</span></div>
      <div className="term-footer-controls">
        <button type="button" onClick={previous} disabled={index === 0} aria-label="Previous chapter" title="Previous chapter"><ChevronLeft size={15}/></button>
        <select aria-label="Chapter or page" value={index} onChange={event => onPage(Number(event.target.value))}>
          {titles.map((chapter, n) => <option value={n} key={n}>{chapter.title}</option>)}
        </select>
        <button type="button" onClick={next} disabled={index >= titles.length - 1} aria-label="Next chapter" title="Next chapter"><ChevronRight size={15}/></button>
        <select aria-label="Line grouping" value={mode} onChange={event => onMode(event.target.value as TextProps['mode'])}>
          <option value="sentence">Sentences</option><option value="paragraph">Paragraphs</option>
        </select>
        <label className="term-appearance"><span>Profile</span><select aria-label="Terminal profile" value={skin} onChange={e => setSkin(e.target.value as TerminalSkin)}>{skins.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
        <button type="button" className="term-open-file" title="Open another book" onClick={openFile}><FolderOpen size={14}/><span>Open</span></button>
      </div>
    </footer>
  </div>;
}
