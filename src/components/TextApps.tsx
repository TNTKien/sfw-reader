import { useEffect, useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { AlignLeft, Book, BookOpen, Braces, ChevronDown, ChevronLeft, ChevronRight, Code2, Columns, Copy, FileCode2, Files, FolderOpen, Github, Grid2X2, Menu, MoreHorizontal, Play, Search, Settings, Split, Table, Type, X } from 'lucide-react';
import { MenuBar, WindowControls } from './Chrome';
import TerminalApps from './TerminalApps';
import { splitText } from '../lib/text';
import type { TextView } from '../types';

export interface TextProps {
  name: string;
  raw: string;
  loading: boolean;
  index: number;
  titles: { title: string }[];
  onPage: (n: number) => void;
  mode: 'sentence' | 'paragraph';
  onMode: (v: 'sentence' | 'paragraph') => void;
  view: TextView;
  setView: (v: TextView) => void;
  openFile: () => void;
  close: () => void;
}

function ChapterNav({ index, titles, onPage }: Pick<TextProps, 'index' | 'titles' | 'onPage'>) {
  return <div className="chapter-nav"><button disabled={!index} onClick={() => onPage(index - 1)} title="Previous chapter/page"><ChevronLeft size={16}/></button><select aria-label="Chapter or page" value={index} onChange={e => onPage(Number(e.target.value))}>{titles.map((chapter, i) => <option key={i} value={i}>{chapter.title}</option>)}</select><button disabled={index >= titles.length - 1} onClick={() => onPage(index + 1)} title="Next chapter/page"><ChevronRight size={16}/></button></div>;
}

function Rows({ rows, view }: { rows: string[]; view: TextView }) {
  const parent = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parent.current,
    estimateSize: () => view === 'excel' ? 50 : 32,
    overscan: 12,
  });
  useEffect(() => { parent.current?.scrollTo({ top: 0 }); virtualizer.scrollToIndex(0); }, [rows, view]);
  const visible = virtualizer.getVirtualItems();
  return <div ref={parent} className={`text-scroll ${view === 'excel' ? 'excel-scroll' : 'code-scroll'}`}>
    {view === 'excel' && <div className="excel-columns"><span className="row-number">⌄</span><span className="column-a">A</span><span>B</span><span>C</span><span>D</span></div>}
    <div style={{ position: 'relative', height: virtualizer.getTotalSize(), minHeight: '100%' }}>
      {visible.map(row => <div key={row.key} data-index={row.index} ref={virtualizer.measureElement}
        className={view === 'excel' ? 'excel-row' : 'code-row'}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${row.start}px)` }}>
        <div className={view === 'excel' ? 'excel-number' : 'code-number'}>{row.index + 1}</div>
        <div className={view === 'excel' ? 'excel-cell' : 'code-content'}>{view === 'code' && <span className="code-var">{row.index % 7 === 0 ? 'const' : row.index % 4 === 0 ? '//' : ''}</span>}{rows[row.index]}</div>
        {view === 'excel' && <><div className="excel-empty"/><div className="excel-empty"/><div className="excel-empty"/></>}
      </div>)}
      {!rows.length && <div className="text-empty">No readable text in this section. If this is a scanned PDF, reopen it in comic mode.</div>}
    </div>
  </div>;
}

function Excel({ props, rows }: { props: TextProps; rows: string[] }) {
  const [tab, setTab] = useState('Home');
  const { name, index, titles, onPage, mode, onMode, openFile, close, setView } = props;
  const tabs = ['File', 'Home', 'Insert', 'Page Layout', 'Formulas', 'Data', 'Review', 'View', 'Help'];
  return <div className="excel app-fill"><div className="excel-titlebar"><span className="excel-logo">X</span><span className="excel-doc">{name}.xlsx <span>• Saved locally</span></span><span className="excel-title-right">SFW Reader / Excel view</span><WindowControls onClose={close}/></div><div className="excel-tabs">{tabs.map(t => <button key={t} onClick={() => { setTab(t); if (t === 'File') openFile(); }} className={tab === t ? 'active' : ''}>{t}</button>)}</div><div className="excel-ribbon"><div className="excel-clipboard"><span className="clipboard-icon">▤</span> Paste <small>Clipboard</small></div><div className="excel-font"><div><span>Aptos　⌄</span><span>11　⌄</span></div><div><b>B</b><i>I</i><u>U</u>　☷　☰　▤</div><small>Font</small></div><div className="excel-alignment"><div>☰　≡　▧　↵　Aa</div><div>⇤　≡　⇥　⌘　▦</div><small>Alignment</small></div><div className="excel-ribbon-spacer"/></div><div className="excel-formula"><span>A1</span><span>✕　✓　ƒx</span><div>{rows[0] || 'Select a row to read'}</div></div><div className="excel-book"><Rows rows={rows} view="excel"/></div><div className="excel-status"><div className="excel-sheet"><button>＋</button><span>Sheet1</span><span className="muted">▦</span></div><div className="excel-info"><ChapterNav index={index} titles={titles} onPage={onPage}/><label>Lines <select value={mode} onChange={e => onMode(e.target.value as typeof mode)}><option value="sentence">Sentence</option><option value="paragraph">Paragraph</option></select></label><button onClick={() => setView('code')} title="Switch to VS Code"><Code2 size={15}/> Code</button></div></div></div>;
}

function Code({ props, rows }: { props: TextProps; rows: string[] }) {
  const { name, index, titles, onPage, mode, onMode, openFile, close, setView } = props;
  const [explorer, setExplorer] = useState(true);
  const menus = [
    {label: 'File', items: [{label:'Open File…', action: openFile, shortcut: 'Ctrl+O'},{label:'Open Recent', disabled: true},{label:'',divider:true},{label:'Close Editor', action: close}]},
    {label:'Edit', items:[{label:'Undo',disabled:true},{label:'Cut',disabled:true},{label:'Find',disabled:true}]},
    {label:'Selection', items:[{label:'Select All',disabled:true}]},
    {label:'View', items:[{label:'Explorer', action:()=>setExplorer(!explorer), checked: explorer}, {label:'Switch to Excel', action:()=>setView('excel')}]},
    {label:'Go', items:[{label:'Next Chapter',action:()=>onPage(Math.min(index+1,titles.length-1))},{label:'Previous Chapter',action:()=>onPage(Math.max(0,index-1))}]},
    {label:'Run', items:[{label:'Start Debugging',disabled:true}]},
    {label:'Terminal', items:[{label:'New Terminal',disabled:true}]},
    {label:'Help',items:[{label:'About SFW Reader',action:()=>alert('SFW Reader opens books from your device and saves your reading position locally.')}]}];
  return <div className="vscode app-fill"><div className="vsc-menuline"><div className="vsc-mark"><Code2 size={20}/></div><MenuBar entries={menus} className="vsc-menus"/><div className="vsc-search"><Search size={13}/> {name}　 <span>⌘ K</span></div><WindowControls onClose={close}/></div><div className="vsc-body"><div className="vsc-activity"><button title="Explorer" className="active" onClick={()=>setExplorer(!explorer)}><Files size={23}/></button><button title="Search"><Search size={22}/></button><button title="Source control"><Split size={22}/></button><button title="Extensions"><Grid2X2 size={22}/></button><div className="vsc-activity-spacer"/><button title="Settings"><Settings size={21}/></button></div>{explorer && <aside className="vsc-explorer"><div className="vsc-explorer-header">EXPLORER <MoreHorizontal size={16}/></div><div className="vsc-project">⌄　SFW-READER</div><div className="vsc-file"><BookOpen size={15} color="#e1b763"/> {name.toLowerCase().replace(/\s+/g, '-')}.md</div><div className="vsc-file"><FileCode2 size={15} color="#70b9df"/> reading-progress.json</div><div className="vsc-outline">OUTLINE</div><div className="vsc-outline">TIMELINE</div></aside>}<div className="vsc-content"><div className="vsc-filetabs"><div className="vsc-tab"><BookOpen size={14} color="#e1b763"/> {name.toLowerCase().replace(/\s+/g, '-')}.md <X size={13}/></div><div className="vsc-toolbar"><Columns size={16}/><MoreHorizontal size={16}/></div></div><div className="vsc-breadcrumb">sfw-reader　›　books　›　{name}.md　›　{titles[index]?.title}</div><div className="vsc-editor"><Rows rows={rows} view="code"/><div className="vsc-minimap"><div>{rows.slice(0, 50).map((row,i)=><span style={{width:`${Math.max(15,Math.min(90,row.length))}%`}} key={i}/>)}</div></div></div></div></div><div className="vsc-status"><div className="vsc-status-left">⑂ main　　◉ 0　⚠ 0</div><div className="vsc-status-right"><ChapterNav index={index} titles={titles} onPage={onPage}/><select aria-label="Line grouping" value={mode} onChange={e => onMode(e.target.value as typeof mode)}><option value="sentence">By sentence</option><option value="paragraph">By paragraph</option></select><button onClick={() => setView('excel')}>Excel view</button>Markdown　 UTF-8　⌁</div></div></div>;
}

export default function TextApps(props: TextProps) {
  const rows = useMemo(() => splitText(props.raw, props.mode), [props.raw, props.mode]);
  if (props.view === 'terminal') return <TerminalApps props={props} rows={rows}/>;
  return props.view === 'excel' ? <Excel props={props} rows={rows}/> : <Code props={props} rows={rows}/>;
}
