import { useEffect, useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { BookOpen, ChevronLeft, ChevronRight, Code2, Columns2, Ellipsis, Files, GitBranch, GitFork, Grid2X2, PanelBottom, PanelLeft, Play, Search, Settings, Split, X } from 'lucide-react';
import { MenuBar, WindowControls } from './Chrome';
import RepoExplorer from './RepoExplorer';
import { repositoryFiles, repositoryPreviews } from '../generated/repositoryFiles';
import type { TextProps } from './TextApps';

type Activity = 'explorer' | 'search' | 'source' | 'run' | 'extensions';
const STORY = '__story__';
const activeName = (path: string, bookFile: string) => path === STORY ? bookFile : path.split('/').at(-1) ?? path;

function StoryLines({ rows, jump }: {rows: string[]; jump: number | null}) {
  const parent = useRef<HTMLDivElement>(null);
  const list = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parent.current,
    estimateSize: () => 28,
    overscan: 12,
  });
  useEffect(() => { parent.current?.scrollTo({top:0}); list.scrollToIndex(0); }, [rows]);
  useEffect(() => { if (jump !== null) list.scrollToIndex(jump, {align:'center'}); }, [jump, list]);
  return <div ref={parent} className="code-scroll text-scroll" role="region" aria-label="Story editor">
    <div className="vsc-code-virtual" style={{height: list.getTotalSize(),position:'relative'}}>
      {list.getVirtualItems().map(row => <div key={row.key} data-index={row.index} ref={list.measureElement}
        className="code-row" style={{position:'absolute',top:0,left:0,width:'100%',transform:'translateY(' + row.start + 'px)'}}>
        <div className="code-number">{row.index + 1}</div>
        <div className="code-content">{rows[row.index]}</div>
      </div>)}
      {!rows.length && <div className="vsc-empty-story">No extractable text in this section. Open scanned PDFs as comics.</div>}
    </div>
  </div>;
}

function SourceView({path}: {path:string}) {
  const content = repositoryPreviews[path];
  if (!content) return <div className="vsc-source-unavailable"><b>{path.split('/').at(-1)}</b><p>Preview is unavailable for this file.</p></div>;
  const lines = content.split('\n');
  return <div className="vsc-source-view">
    {lines.map((line,i) => <div className="vsc-source-line" key={i}>
      <span className="vsc-source-number">{i + 1}</span><span>{line || ' '}</span>
    </div>)}
  </div>;
}

export default function CodeApp({ props, rows }: { props: TextProps; rows: string[] }) {
  const { index, titles, onPage, mode, onMode, openFile, close, setView } = props;
  const bookFile = 'reading-notes.md';
  const [activity, setActivity] = useState<Activity>('explorer');
  const [tabs, setTabs] = useState<string[]>([STORY]);
  const [active, setActive] = useState(STORY);
  const [search, setSearch] = useState('');
  const [quick, setQuick] = useState('');
  const [quickOpen, setQuickOpen] = useState(false);
  const [jump, setJump] = useState<number | null>(null);

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase(), results: {line:string; index:number}[] = [];
    if (!q) return results;
    for (let i = 0; i < rows.length && results.length < 15; i++)
      if (rows[i].toLowerCase().includes(q)) results.push({line:rows[i],index:i});
    return results;
  }, [rows,search]);
  const quickResults = useMemo(() => quick.trim()
    ? repositoryFiles.filter(path=>path.toLowerCase().includes(quick.toLowerCase())).slice(0,8)
    : [], [quick]);

  const openPath = (path: string) => {
    setTabs(prev => prev.includes(path) ? prev : [...prev.slice(-6),path].includes(STORY)
      ? [...prev.slice(-6),path] : [STORY,...prev.slice(-5),path]);
    setActive(path);
    setQuick('');
    setQuickOpen(false);
  };
  const closeTab = (path: string) => {
    if (path === STORY) { setActive(STORY); return; } // Story remains reachable.
    setTabs(previous => previous.filter(item => item !== path));
    setActive(previous => previous === path ? STORY : previous);
  };
  const chooseStoryResult = (i:number) => {setActive(STORY);setJump(i);};
  const menus = [
    {label:'File',items:[{label:'Open File…',action:openFile,shortcut:'Ctrl+O'},{label:'Open Recent',disabled:true},{label:'',divider:true},{label:'Close Editor',action:close}]},
    {label:'Edit',items:[{label:'Undo',disabled:true},{label:'Find in Files',action:()=>setActivity('search'),shortcut:'Ctrl+Shift+F'}]},
    {label:'Selection',items:[{label:'Select All',disabled:true}]},
    {label:'View',items:[{label:'Explorer',checked:activity==='explorer',action:()=>setActivity('explorer')},{label:'Search',checked:activity==='search',action:()=>setActivity('search')}]},
    {label:'Go',items:[{label:'Next Chapter',disabled:index>=titles.length-1,action:()=>onPage(index+1)},{label:'Previous Chapter',disabled:!index,action:()=>onPage(index-1)}]},
    {label:'Run',items:[{label:'Start Debugging',disabled:true}]},
    {label:'Terminal',items:[{label:'New Terminal',action:()=>setView('terminal')}]},
    {label:'Help',items:[{label:'About SFW Reader',action:()=>alert('SFW Reader opens local books and stores progress in your browser.')}]},
  ];
  return <div className="vscode app-fill vscode-repository">
    <div className="vsc-menuline">
      <div className="vsc-mark"><Code2 size={20}/></div>
      <MenuBar entries={menus} className="vsc-menus"/>
      <span className="vsc-history-arrows">‹　›</span>
      <div className="vsc-quick-container">
        <label className="vsc-quick-search"><Search size={13}/><input aria-label="Go to file" value={quick} onChange={e=>{setQuick(e.target.value);setQuickOpen(true);}} onFocus={()=>setQuickOpen(true)} onKeyDown={e=>{if(e.key==='Escape')setQuickOpen(false); if(e.key==='Enter'&&quickResults.length)openPath(quickResults[0]);}} placeholder="sfw-reader"/><span>⌘ P</span></label>
        {quickOpen && quickResults.length>0 && <div className="vsc-quick-results">{quickResults.map(path=>
          <button type="button" key={path} onClick={()=>openPath(path)}>{path}</button>)}</div>}
      </div>
      <span className="vsc-title-actions"><PanelLeft size={16}/><PanelBottom size={16}/><Columns2 size={16}/></span>
      <WindowControls onClose={close}/>
    </div>
    <div className="vsc-body">
      <div className="vsc-activity">
        <button title="Explorer" aria-label="Explorer" aria-pressed={activity==='explorer'} className={activity==='explorer'?'active':''} onClick={()=>setActivity('explorer')}><Files size={23}/></button>
        <button title="Search" aria-label="Search" aria-pressed={activity==='search'} className={activity==='search'?'active':''} onClick={()=>setActivity('search')}><Search size={22}/></button>
        <button title="Source Control" aria-label="Source Control" aria-pressed={activity==='source'} className={activity==='source'?'active':''} onClick={()=>setActivity('source')}><GitFork size={21}/></button>
        <button title="Run and Debug" aria-label="Run and Debug" aria-pressed={activity==='run'} className={activity==='run'?'active':''} onClick={()=>setActivity('run')}><Play size={21}/></button>
        <button title="Extensions" aria-label="Extensions" aria-pressed={activity==='extensions'} className={activity==='extensions'?'active':''} onClick={()=>setActivity('extensions')}><Grid2X2 size={22}/></button>
        <div className="vsc-activity-spacer"/><button title="Manage" aria-label="Manage"><Settings size={21}/></button>
      </div>
      <aside className="vsc-explorer">
        {activity === 'explorer' ? <RepoExplorer selectedPath={active===STORY?null:active} onFile={openPath} onStory={()=>setActive(STORY)} chapterTitle={titles[index]?.title||'Current chapter'}/> :
        activity==='search' ? <div className="vsc-search-panel"><div className="vsc-explorer-header">SEARCH <Ellipsis size={16}/></div>
          <input type="search" aria-label="Search current chapter" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search in current chapter"/>
          <small>{search ? searchResults.length+' results' : 'Search in the open book'}</small>
          {searchResults.map(item=><button key={item.index} className="vsc-search-hit" onClick={()=>chooseStoryResult(item.index)}><b>{bookFile}:{item.index+1}</b><span>{item.line.slice(0,90)}</span></button>)}
        </div> : <div className="vsc-other-panel"><div className="vsc-explorer-header">{activity==='source'?'SOURCE CONTROL':activity==='run'?'RUN AND DEBUG':'EXTENSIONS'} <Ellipsis size={16}/></div><span>{activity==='source'?'Changes 0':activity==='run'?'Run and Debug':'Installed'}</span></div>}
      </aside>
      <div className="vsc-content">
        <div className="vsc-filetabs" role="tablist" aria-label="Open editor tabs">
          <div className="vsc-open-tabs">{tabs.map(path => <div key={path} className={'vsc-open-tab'+(active===path?' current':'')}>
            <button type="button" role="tab" aria-selected={active===path} title={path===STORY?'Story':path} onClick={()=>setActive(path)}>
              {path===STORY?<BookOpen size={15} color="#e1b763"/>:<Code2 size={14} color="#5ba8d5"/>}<span>{activeName(path,bookFile)}</span>
            </button>
            {path!==STORY && <button type="button" aria-label={'Close '+path} title="Close tab" className="vsc-close-tab" onClick={()=>closeTab(path)}><X size={13}/></button>}
          </div>)}</div>
          <div className="vsc-toolbar"><Columns2 size={16}/><Ellipsis size={16}/></div>
        </div>
        <div className="vsc-breadcrumb">
          {active===STORY ? <>books　›　{bookFile}　›　{titles[index]?.title}</> : active.replaceAll('/', '　›　')}
        </div>
        <div className="vsc-editor">
          {active===STORY ? <StoryLines rows={rows} jump={jump}/> : <SourceView path={active}/>}
          {active===STORY && <div className="vsc-minimap"><div>{rows.slice(0,65).map((text,i)=><span key={i} style={{width:Math.max(12,Math.min(96,text.length))+'%'}}/>)}</div></div>}
        </div>
      </div>
    </div>
    <div className="vsc-status">
      <div className="vsc-status-left"><GitBranch size={14}/> main　 ⊗ 0　⚠ 0　↻ <span className="vsc-status-branch">sfw-reader</span></div>
      <div className="vsc-status-right">
        <button disabled={index===0} aria-label="Previous chapter" onClick={()=>onPage(index-1)}><ChevronLeft size={14}/></button>
        <select aria-label="Chapter or page" value={index} onChange={e=>onPage(Number(e.target.value))}>{titles.map((chapter,i)=><option key={i} value={i}>{chapter.title}</option>)}</select>
        <button disabled={index>=titles.length-1} aria-label="Next chapter" onClick={()=>onPage(index+1)}><ChevronRight size={14}/></button>
        <select aria-label="Line grouping" value={mode} onChange={e=>onMode(e.target.value as TextProps['mode'])}><option value="sentence">Sentences</option><option value="paragraph">Paragraphs</option></select>
        <span>UTF-8　{active===STORY?'Markdown':'Plain Text'}</span>
      </div>
    </div>
  </div>;
}
