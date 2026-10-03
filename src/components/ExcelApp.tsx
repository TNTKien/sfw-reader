import { useEffect, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { AlignCenter, AlignLeft, AlignRight, ArrowDownAZ, Bold, ChevronDown, ChevronLeft, ChevronRight, Clipboard, Copy, FileSpreadsheet, FolderOpen, Italic, MessageSquare, Paintbrush, Redo2, Save, Scissors, Search, Share2, Sigma, Underline, Undo2 } from 'lucide-react';
import { WindowControls } from './Chrome';
import type { TextProps } from './TextApps';

const columns = Array.from({length: 23}, (_, n) => String.fromCharCode(65 + n));

// Secondary workbook content is decorative. The imported story stays in column A.
const officeCells: Record<number, Record<string, string>> = {
  0: { C: 'Q4 DELIVERY TRACKER', J: 'WORKBOOK SUMMARY' },
  1: { C: 'Workstream', D: 'Priority', E: 'Status', F: 'Owner', G: 'Due', H: 'Progress', J: 'Metric', K: 'Value' },
  2: { C: 'UI refresh', D: 'High', E: 'In review', F: 'Design', G: 'Oct 09', H: '84%', J: 'Open items', K: '12' },
  3: { C: 'QA checklist', D: 'Medium', E: 'Completed', F: 'Team', G: 'Oct 10', H: '100%', J: 'Completed', K: '36' },
  4: { C: 'Asset audit', D: 'Low', E: 'Pending', F: 'Ops', G: 'Oct 12', H: '45%', J: 'On track', K: '92%' },
  5: { C: 'Design review', D: 'High', E: 'In progress', F: 'Design', G: 'Oct 15', H: '68%' },
  6: { C: 'Release notes', D: 'Medium', E: 'Draft', F: 'Content', G: 'Oct 16', H: '35%' },
  9: { C: 'NOTES' },
  10: { C: 'Weekly checkpoint', D: 'Friday', F: 'Owner', G: 'Team' },
  11: { C: 'Next sync', D: '09:30', F: 'Version', G: 'v0.2' },
};

type Cell = { row: number; col: string };
const valueAt = (row: number, col: string, rows: string[]) =>
  col === 'A' ? (rows[row] ?? '') : (officeCells[row]?.[col] ?? '');

function Sheet({ rows, selected, select, change }: {
  rows: string[];
  selected: Cell;
  select: (cell: Cell) => void;
  change: string;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const total = Math.max(150, rows.length);
  const virtualizer = useVirtualizer({
    count: total,
    getScrollElement: () => scroller.current,
    estimateSize: () => 29,
    overscan: 8,
  });
  useEffect(() => { scroller.current?.scrollTo({top: 0}); virtualizer.scrollToIndex(0); }, [change]);
  return <div className="excel-sheet-scroll" ref={scroller}>
    <div className="excel-grid-head" role="row">
      <span className="excel-grid-corner"/>
      {columns.map(col => <span key={col} className={selected.col === col ? 'selected' : ''}>{col}</span>)}
    </div>
    <div className="excel-grid-virtual" style={{height: virtualizer.getTotalSize()}}>
      {virtualizer.getVirtualItems().map(item => <div
        key={item.key}
        data-index={item.index}
        ref={virtualizer.measureElement}
        className="excel-grid-row"
        style={{position: 'absolute', top: 0, left: 0, width: '100%', transform: 'translateY(' + item.start + 'px)'}}>
        <span className={'excel-grid-row-num' + (selected.row === item.index ? ' selected' : '')}>{item.index + 1}</span>
        {columns.map(col => {
          const text = valueAt(item.index, col, rows);
          const isSelected = selected.row === item.index && selected.col === col;
          const officeHeader = item.index === 0 && ['C', 'J'].includes(col) || item.index === 1 && 'CDEFGHJK'.includes(col);
          return <button type="button" role="gridcell" key={col}
            aria-selected={isSelected}
            className={'excel-grid-cell' + (isSelected ? ' selected' : '') + (officeHeader ? ' office-heading' : '') + (text === 'Completed' ? ' excel-cell-complete' : '')}
            onClick={() => select({row: item.index, col})}
            title={text ? text : col + (item.index + 1)}>
            {text}
          </button>;
        })}
      </div>)}
    </div>
  </div>;
}

const tabs = ['File', 'Home', 'Insert', 'Draw', 'Page Layout', 'Formulas', 'Data', 'Review', 'View', 'Automate', 'Help'];

function Ribbon({ tab }: {tab: string}) {
  if (tab !== 'Home') {
    const others: Record<string, {title: string; items: string[]}[]> = {
      Insert: [{title:'Tables',items:['PivotTable', 'Recommended PivotTables', 'Table']},{title:'Illustrations',items:['Pictures','Shapes','Icons']},{title:'Charts',items:['Recommended Charts','Column','Line']}],
      Data: [{title:'Get & Transform Data',items:['Get Data','Refresh All']},{title:'Sort & Filter',items:['Sort','Filter','Clear']},{title:'Data Tools',items:['Text to Columns','Remove Duplicates']}],
      Formulas: [{title:'Function Library',items:['Insert Function','AutoSum','Recently Used']},{title:'Defined Names',items:['Name Manager','Define Name']}],
      View: [{title:'Workbook Views',items:['Normal','Page Layout','Page Break Preview']},{title:'Show',items:['Formula Bar','Gridlines','Headings']},{title:'Zoom',items:['100%','Zoom to Selection']}],
    };
    const groups = others[tab] || [{title:tab,items:[tab + ' options','Preferences','Settings']}];
    return <div className="excel-ribbon excel-ribbon-alternative">{groups.map(group =>
      <div className="excel-tool-group" key={group.title}><div className="excel-simple-tools">{group.items.map((item, i) =>
        <span key={item}><span className="excel-placeholder-symbol">{['▤','▦','◈'][i % 3]}</span>{item}</span>)}</div>
        <small>{group.title}</small></div>)}
    </div>;
  }
  return <div className="excel-ribbon excel-ribbon-detailed">
    <div className="excel-tool-group excel-clipboard-tools">
      <div className="excel-group-content"><div className="excel-large-icon"><Clipboard size={26}/><span>Paste <ChevronDown size={11}/></span></div>
        <div className="excel-small-icons"><span><Scissors size={17}/></span><span><Copy size={17}/></span><span><Paintbrush size={17}/></span></div></div>
      <small>Clipboard</small>
    </div>
    <div className="excel-tool-group excel-font-tools">
      <div className="excel-font-selects"><span>Aptos Narrow <ChevronDown size={12}/></span><span>11 <ChevronDown size={12}/></span><b>A˄</b><b>A˅</b></div>
      <div className="excel-ribbon-icons"><Bold size={16}/><Italic size={16}/><Underline size={16}/><span>▦</span><span className="excel-highlight-marker">▰</span><span className="excel-red-marker">A</span></div>
      <small>Font</small>
    </div>
    <div className="excel-tool-group excel-alignment-tools">
      <div className="excel-ribbon-icons"><AlignLeft size={17}/><AlignCenter size={17}/><AlignRight size={17}/><span>↗</span><span>↵ Wrap Text</span></div>
      <div className="excel-ribbon-icons"><span>≡</span><span>☷</span><span>⇥</span><span>⇤</span><span>▦ Merge &amp; Center</span></div>
      <small>Alignment</small>
    </div>
    <div className="excel-tool-group excel-number-tools">
      <div className="excel-number-select">General <ChevronDown size={12}/></div>
      <div className="excel-ribbon-icons"><span>$</span><span>%</span><span>,</span><span>.0←</span><span>→.00</span></div>
      <small>Number</small>
    </div>
    <div className="excel-tool-group excel-styles-tools">
      <div className="excel-tall-tools"><span><span>▦</span>Conditional<br/>Formatting</span><span><span>▨</span>Format as<br/>Table</span><span><span>▤</span>Cell<br/>Styles</span></div>
      <small>Styles</small>
    </div>
    <div className="excel-tool-group excel-cells-tools">
      <div className="excel-tall-tools"><span><span>▥</span>Insert</span><span><span>▧</span>Delete</span><span><span>▦</span>Format</span></div>
      <small>Cells</small>
    </div>
    <div className="excel-tool-group excel-editing-tools">
      <div className="excel-tall-tools"><span><Sigma size={23}/>AutoSum</span><span><ArrowDownAZ size={23}/>Sort &amp;<br/>Filter</span><span><Search size={23}/>Find &amp;<br/>Select</span></div>
      <small>Editing</small>
    </div>
  </div>;
}

export default function ExcelApp({props, rows}: {props: TextProps; rows: string[]}) {
  const { name, index, titles, onPage, mode, onMode, openFile, close } = props;
  const [tab, setTab] = useState('Home');
  const [selected, select] = useState<Cell>({row: 0, col: 'A'});
  const [excelZoom, setExcelZoom] = useState(100);
  useEffect(() => select({row:0,col:'A'}), [index, mode, name]);
  const displayName = 'Book1 - Excel';
  const expression = valueAt(selected.row, selected.col, rows);
  return <div className="excel app-fill excel-native">
    <div className="excel-titlebar">
      <span className="excel-logo"><FileSpreadsheet size={18}/></span>
      <span className="excel-autosave">AutoSave <span className="excel-autosave-off"><i/> Off</span></span>
      <span className="excel-title-quick-access"><Save size={18} color="#9d288f"/><Undo2 size={18}/><Redo2 size={18}/><ChevronDown size={13}/></span>
      <span className="excel-doc" title={name}>{displayName}</span>
      <span className="excel-title-search"><Search size={16}/> Search</span>
      <span className="excel-user-avatar" aria-hidden="true">R</span>
      <WindowControls onClose={close}/>
    </div>
    <div className="excel-tabs">
      <div className="excel-tab-labels">{tabs.map(t => <button type="button" key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>)}</div>
      <div className="excel-collaboration"><span><MessageSquare size={15}/> Comments</span><span className="excel-share"><Share2 size={15}/> Share⌄</span></div>
    </div>
    {tab === 'File' ? <div className="excel-backstage"><aside><strong>File</strong><button onClick={() => setTab('Home')}>← Back</button><button onClick={openFile}>Open</button><button onClick={() => setTab('Home')}>Info</button></aside><main><h2>Open</h2><p>Recent</p><button onClick={openFile}><FolderOpen size={18}/> Browse this device</button></main></div> : <>
      <Ribbon tab={tab}/>
      <div className="excel-formula"><span className="excel-name-box">{selected.col}{selected.row + 1} <ChevronDown size={13}/></span><span className="excel-formula-actions">×　✓　ƒx</span><div title={expression}>{expression}</div><ChevronDown size={14}/></div>
      <div className="excel-book"><Sheet rows={rows} selected={selected} select={select} change={name + ':' + index + ':' + mode}/></div>
      <div className="excel-sheet-tabs"><span className="excel-sheet-arrows">‹　›</span><span className="excel-sheet-active">Sheet1</span><button title="Add sheet" disabled>＋</button><span className="excel-horizontal-track"><span/></span></div>
      <footer className="excel-native-status"><div className="excel-status-left"><span>Ready</span><span>♧ Accessibility: Good to go</span></div>
        <div className="excel-bottom-reader"><button disabled={index === 0} title="Previous chapter" onClick={() => onPage(index - 1)}><ChevronLeft size={15}/></button>
          <select aria-label="Chapter or page" value={index} onChange={e => onPage(Number(e.target.value))}>{titles.map((chapter, i) => <option key={i} value={i}>{chapter.title}</option>)}</select>
          <button disabled={index >= titles.length - 1} title="Next chapter" onClick={() => onPage(index + 1)}><ChevronRight size={15}/></button>
          <select aria-label="Line grouping" value={mode} onChange={e => onMode(e.target.value as TextProps['mode'])}><option value="sentence">Sentences</option><option value="paragraph">Paragraphs</option></select>
        </div>
        <div className="excel-native-zoom"><span>▦　▤　▥</span><button type="button" onClick={() => setExcelZoom(z=>Math.max(70,z-10))}>−</button><input type="range" aria-label="Sheet zoom" min="70" max="130" step="10" value={excelZoom} onChange={e=>setExcelZoom(Number(e.target.value))}/><button type="button" onClick={() => setExcelZoom(z=>Math.min(130,z+10))}>＋</button><span>{excelZoom}%</span></div>
      </footer>
    </>}
  </div>;
}
