import { useEffect, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ChevronDown, ChevronLeft, ChevronRight, FileSpreadsheet, FolderOpen, MessageSquare, Redo2, Save, Search, Share2, Undo2 } from 'lucide-react';
import { WindowControls } from './Chrome';
import ExcelRibbon from './ExcelRibbon';
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

function Sheet({ rows, selected, select, change, zoom }: {
  rows: string[];
  selected: Cell;
  select: (cell: Cell) => void;
  change: string;
  zoom: number;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const total = Math.max(150, rows.length);
  const virtualizer = useVirtualizer({
    count: total,
    getScrollElement: () => scroller.current,
    estimateSize: () => Math.round(38 * zoom / 100),
    overscan: 8,
  });
  useEffect(() => { scroller.current?.scrollTo({top: 0}); virtualizer.scrollToIndex(0); }, [change]);
  useEffect(() => { virtualizer.measure(); }, [zoom, virtualizer]);
  return <div className="excel-sheet-scroll" ref={scroller} style={{ "--sheet-zoom": zoom / 100 } as React.CSSProperties}>
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
      <ExcelRibbon tab={tab}/>
      <div className="excel-formula"><span className="excel-name-box">{selected.col}{selected.row + 1} <ChevronDown size={13}/></span><span className="excel-formula-actions">×　✓　ƒx</span><div title={expression}>{expression}</div><ChevronDown size={14}/></div>
      <div className="excel-book"><Sheet rows={rows} selected={selected} select={select} change={name + ':' + index + ':' + mode} zoom={excelZoom}/></div>
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
