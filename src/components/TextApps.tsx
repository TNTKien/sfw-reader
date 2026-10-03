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

function Rows({ rows, view, selected = 0, onSelect }: { rows: string[]; view: TextView; selected?: number; onSelect?: (index: number) => void }) {
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
        className={view === 'excel' ? 'excel-row' + (selected === row.index ? ' excel-row-selected' : '') : 'code-row'}
        onClick={() => onSelect?.(row.index)}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${row.start}px)` }}>
        <div className={view === 'excel' ? 'excel-number' : 'code-number'}>{row.index + 1}</div>
        <div className={view === 'excel' ? 'excel-cell' : 'code-content'}>{rows[row.index]}</div>
        {view === 'excel' && <><div className="excel-empty"/><div className="excel-empty"/><div className="excel-empty"/></>}
      </div>)}
      {!rows.length && <div className="text-empty">No readable text in this section. If this is a scanned PDF, reopen it in comic mode.</div>}
    </div>
  </div>;
}

function Excel({ props, rows }: { props: TextProps; rows: string[] }) {
  const [tab, setTab] = useState('Home');
  const [selectedRow, setSelectedRow] = useState(0);
  const { name, index, titles, onPage, mode, onMode, openFile, close } = props;
  useEffect(() => setSelectedRow(0), [index, mode]);
  const tabs = ['File', 'Home', 'Insert', 'Page Layout', 'Formulas', 'Data', 'Review', 'View', 'Help'];
  const ribbon = tab === 'Insert' ? [
    { name: 'Tables', symbols: '▦　▥　▤', caption: 'PivotTable　Table' },
    { name: 'Illustrations', symbols: '▧　▨　◈', caption: 'Pictures　Shapes' },
    { name: 'Charts', symbols: '▂▅▇　◔　▤', caption: 'Recommended Charts' },
  ] : tab === 'Data' ? [
    { name: 'Get & Transform', symbols: '▣　⬇　⤴', caption: 'Get Data　Recent Sources' },
    { name: 'Sort & Filter', symbols: '≡↓　▾　⊝', caption: 'Sort　Filter　Clear' },
    { name: 'Data Tools', symbols: '▥　▧', caption: 'Text to Columns' },
  ] : tab === 'View' ? [
    { name: 'Workbook Views', symbols: '▦　▤　▨', caption: 'Normal　Page Layout' },
    { name: 'Show', symbols: '☑　☑　☑', caption: 'Gridlines　Headings' },
    { name: 'Zoom', symbols: '⊕　100%', caption: 'Zoom to Selection' },
  ] : [
    { name: 'Clipboard', symbols: '▤　✂　▣', caption: 'Paste　Cut　Copy' },
    { name: 'Font', symbols: 'B　𝑰　U　▾', caption: 'Aptos　　　　　　 11' },
    { name: 'Alignment', symbols: '≡　☰　⇤　⇥', caption: 'Wrap Text　Merge & Center' },
    { name: 'Number', symbols: '0.0　%　,', caption: 'General' },
    { name: 'Styles', symbols: '▨　▦', caption: 'Conditional Formatting' },
  ];
  return <div className="excel app-fill">
    <div className="excel-titlebar"><span className="excel-logo">X</span>
      <span className="excel-title-quick-access">↶　↷　▾</span>
      <span className="excel-doc">{name.replace(/\.[^.]+$/, '')}.xlsx</span>
      <span className="excel-title-right"><Search size={13}/> Search (Alt + Q)</span>
      <WindowControls onClose={close}/>
    </div>
    <div className="excel-tabs">{tabs.map(t => <button key={t} onClick={() => setTab(t)} className={tab === t ? 'active' : ''}>{t}</button>)}</div>
    {tab === 'File' ? <div className="excel-backstage"><aside><strong>File</strong><button onClick={() => setTab('Home')}>← Back</button><button onClick={openFile}>Open</button><button onClick={() => setTab('Home')}>Info</button></aside><main><h2>Open</h2><p>Recent</p><button onClick={openFile}><FolderOpen size={18}/> Browse this device</button></main></div> : <>
      <div className="excel-ribbon">{ribbon.map(group => <div className="excel-ribbon-group" key={group.name}>
        <div className="excel-ribbon-symbols">{group.symbols}</div>
        <div className="excel-ribbon-caption">{group.caption}</div>
        <small>{group.name}</small>
      </div>)}<div className="excel-ribbon-spacer"/></div>
      <div className="excel-formula"><span className="excel-name-box">A{selectedRow + 1} ⌄</span><span>✕　✓　ƒx</span><div>{rows[selectedRow] || 'Select a row to read'}</div></div>
      <div className="excel-book"><Rows rows={rows} view="excel" selected={selectedRow} onSelect={setSelectedRow}/></div>
      <div className="excel-status"><div className="excel-sheet"><button title="Add worksheet" disabled>＋</button><span>Sheet1</span><span className="muted">▦</span></div>
        <div className="excel-info"><span className="excel-ready">Ready</span><ChapterNav index={index} titles={titles} onPage={onPage}/><label>Rows <select value={mode} onChange={e => onMode(e.target.value as typeof mode)}><option value="sentence">Sentence</option><option value="paragraph">Paragraph</option></select></label><span className="excel-zoom-status">100%　⊖ ─── ◉ ─── ⊕</span></div>
      </div>
    </>}
  </div>;
}

function Code({ props, rows }: { props: TextProps; rows: string[] }) {
  const { name, index, titles, onPage, mode, onMode, openFile, close, setView } = props;
  const [activity, setActivity] = useState<'explorer' | 'search' | 'source' | 'extensions'>('explorer');
  const [searchText, setSearchText] = useState('');
  const fileName = name.replace(/\.[^.]+$/, '').replace(/\s+/g, '-').toLowerCase() + '.md';
  const searchResults = useMemo(() => searchText.trim()
    ? rows.map((value, i) => ({value, i})).filter(({value}) => value.toLowerCase().includes(searchText.toLowerCase())).slice(0, 12)
    : [], [rows, searchText]);
  const menus = [
    {label: 'File', items: [{label:'Open File…', action: openFile, shortcut: 'Ctrl+O'},{label:'Open Recent', disabled: true},{label:'',divider:true},{label:'Close Editor', action: close}]},
    {label:'Edit', items:[{label:'Undo',disabled:true},{label:'Cut',disabled:true},{label:'Find',action:()=>setActivity('search'),shortcut:'Ctrl+F'}]},
    {label:'Selection', items:[{label:'Select All',disabled:true}]},
    {label:'View', items:[{label:'Explorer', action:()=>setActivity('explorer'), checked: activity === 'explorer'}, {label:'Search',action:()=>setActivity('search'), checked: activity === 'search'}, {label:'Switch to Excel',action:()=>setView('excel')}]},
    {label:'Go', items:[{label:'Next Chapter',action:()=>onPage(Math.min(index+1,titles.length-1))},{label:'Previous Chapter',action:()=>onPage(Math.max(0,index-1))}]},
    {label:'Run', items:[{label:'Start Debugging',disabled:true}]},
    {label:'Terminal', items:[{label:'New Terminal',action:()=>setView('terminal')}]},
    {label:'Help',items:[{label:'About SFW Reader',action:()=>alert('SFW Reader opens books from your device and saves your reading position locally.')}]}];
  return <div className="vscode app-fill">
    <div className="vsc-menuline"><div className="vsc-mark"><Code2 size={20}/></div>
      <MenuBar entries={menus} className="vsc-menus"/>
      <div className="vsc-search"><Search size={13}/> {fileName} <span>Ctrl + P</span></div><WindowControls onClose={close}/>
    </div>
    <div className="vsc-body"><div className="vsc-activity">
      <button title="Explorer" aria-pressed={activity === 'explorer'} className={activity === 'explorer' ? 'active' : ''} onClick={()=>setActivity('explorer')}><Files size={23}/></button>
      <button title="Search" aria-pressed={activity === 'search'} className={activity === 'search' ? 'active' : ''} onClick={()=>setActivity('search')}><Search size={22}/></button>
      <button title="Source Control" aria-pressed={activity === 'source'} className={activity === 'source' ? 'active' : ''} onClick={()=>setActivity('source')}><Split size={22}/></button>
      <button title="Extensions" aria-pressed={activity === 'extensions'} className={activity === 'extensions' ? 'active' : ''} onClick={()=>setActivity('extensions')}><Grid2X2 size={22}/></button>
      <div className="vsc-activity-spacer"/><button title="Manage"><Settings size={21}/></button>
    </div>
    <aside className="vsc-explorer">
      <div className="vsc-explorer-header">{activity === 'source' ? 'SOURCE CONTROL' : activity === 'extensions' ? 'EXTENSIONS' : activity.toUpperCase()} <MoreHorizontal size={16}/></div>
      {activity === 'explorer' ? <><div className="vsc-project">⌄　BOOKS</div>
        <div className="vsc-file vsc-file-selected"><BookOpen size={15} color="#e1b763"/> {fileName}</div>
        <div className="vsc-file"><FileCode2 size={15} color="#70b9df"/> reading-progress.json</div>
        <div className="vsc-outline">OUTLINE</div><div className="vsc-outline-item">⌄ {titles[index]?.title}</div><div className="vsc-outline">TIMELINE</div>
      </> : activity === 'search' ? <div className="vsc-side-search"><input type="search" aria-label="Search in book" placeholder="Search" value={searchText} onChange={e=>setSearchText(e.target.value)}/>
        <small>{searchText ? searchResults.length + ' visible results' : 'Search in current chapter'}</small>
        {searchResults.map(({value,i})=><div className="vsc-search-result" key={i}><span>{fileName}:{i+1}</span>{value.slice(0,125)}</div>)}
      </div> : activity === 'source' ? <div className="vsc-empty-side">CHANGES <span>0</span><p>No changes</p></div> :
        <div className="vsc-side-search"><input type="search" placeholder="Search Extensions" aria-label="Search Extensions"/><small>Installed</small></div>}
    </aside>
    <div className="vsc-content">
      <div className="vsc-filetabs"><div className="vsc-tab"><BookOpen size={14} color="#e1b763"/>{fileName}<span className="vsc-tab-close">×</span></div><div className="vsc-toolbar"><Columns size={16}/><MoreHorizontal size={16}/></div></div>
      <div className="vsc-breadcrumb">books　›　{fileName}　›　{titles[index]?.title}</div>
      <div className="vsc-editor"><Rows rows={rows} view="code"/><div className="vsc-minimap"><div>{rows.slice(0,50).map((row,i)=><span style={{width:`${Math.max(15,Math.min(90,row.length))}%`}} key={i}/>)}</div></div></div>
    </div></div>
    <div className="vsc-status"><div className="vsc-status-left">⑂ main　　⊗ 0　⚠ 0</div><div className="vsc-status-right"><ChapterNav index={index} titles={titles} onPage={onPage}/>
      <select aria-label="Line grouping" value={mode} onChange={e=>onMode(e.target.value as typeof mode)}><option value="sentence">By sentence</option><option value="paragraph">By paragraph</option></select>
      Markdown　 UTF-8　⌁
    </div></div>
  </div>;
}

export default function TextApps(props: TextProps) {
  const rows = useMemo(() => splitText(props.raw, props.mode), [props.raw, props.mode]);
  if (props.view === 'terminal') return <TerminalApps props={props} rows={rows}/>;
  return props.view === 'excel' ? <Excel props={props} rows={rows}/> : <Code props={props} rows={rows}/>;
}
