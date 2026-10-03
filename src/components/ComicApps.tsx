import { useEffect, useState } from 'react';
import { AlignLeft, ArrowLeft, BookOpen, Brush, ChevronDown, ChevronLeft, ChevronRight, Crop, Download, Eraser, Eye, FileImage, FolderOpen, Hand, Image as ImageIcon, Layers, LayoutTemplate, Maximize, MousePointer2, Move, PaintBucket, PanelLeft, PanelRight, PenTool, Pipette, Plus, Search, Settings2, Shapes, SlidersHorizontal, Sparkles, Square, Type, WandSparkles, ZoomIn, ZoomOut } from 'lucide-react';
import { MenuBar, PageSelect, WindowControls } from './Chrome';
import type { ComicView } from '../types';

export interface ComicProps {
  name: string;
  image: string | null;
  index: number;
  count: number;
  zoom: number;
  view: ComicView;
  setZoom: (zoom: number) => void;
  onPage: (index: number) => void;
  openFile: () => void;
  close: () => void;
  setView: (view: ComicView) => void;
}

const toolIcons = [Move, Square, MousePointer2, Crop, Brush, Eraser, PaintBucket, Pipette, PenTool, Type, Hand, ZoomIn];
const toolNames = ['Move', 'Marquee', 'Lasso', 'Crop', 'Brush', 'Eraser', 'Fill', 'Eyedropper', 'Pen', 'Text', 'Hand', 'Zoom'];

function ImageCanvas({ src, name, zoom }: { src: string | null; name: string; zoom: number }) {
  return <div className="image-stage">
    {src ? <img draggable={false} className="comic-image" src={src} alt={`Comic page from ${name}`} style={{ width: `${zoom}%` }} />
      : <div className="image-loading"><div className="loading-spinner" />Rendering page…</div>}
  </div>;
}

function Navigation({ page, count, onPage }: { page: number; count: number; onPage: (i: number) => void }) {
  return <div className="page-nav">
    <button title="Previous page" disabled={page === 0} onClick={() => onPage(page - 1)}><ChevronLeft size={16} /></button>
    <span>{page + 1} <span className="muted">/ {count}</span></span>
    <button title="Next page" disabled={page === count - 1} onClick={() => onPage(page + 1)}><ChevronRight size={16} /></button>
  </div>;
}

function Photoshop({ props }: { props: ComicProps }) {
  const { image, index, count, name, zoom, setZoom, onPage, openFile, close, setView } = props;
  const [tool, setTool] = useState('Text');
  const [left, setLeft] = useState(true);
  const [right, setRight] = useState(true);
  const [layers, setLayers] = useState(true);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  useEffect(() => {
    if (!image) { setDimensions(null); return; }
    let current = true;
    const img = new window.Image();
    img.onload = () => { if (current) setDimensions({ width: img.naturalWidth, height: img.naturalHeight }); };
    img.src = image;
    return () => { current = false; };
  }, [image]);
  const documentName = name.replace(/\.[^.]+$/, '');
  const tabStart = Math.min(Math.max(0, index - 2), Math.max(0, count - 5));
  const neighboringPages = Array.from({ length: Math.min(count, 5) }, (_, i) => tabStart + i);
  const menu = [
    { label: 'File', items: [
      { label: 'New…', disabled: true, shortcut: 'Ctrl+N' },
      { label: 'Open…', action: openFile, shortcut: 'Ctrl+O' },
      { label: 'Open Recent', disabled: true },
      { label: '', divider: true },
      { label: 'Save', disabled: true, shortcut: 'Ctrl+S' },
      { label: 'Export', disabled: true },
      { label: '', divider: true },
      { label: 'Close document', action: close, shortcut: 'Ctrl+W' },
    ] },
    { label: 'Edit', items: [ { label: 'Undo', disabled: true }, { label: 'Cut', disabled: true }, { label: 'Copy', disabled: true }, { label: 'Preferences…', disabled: true } ] },
    { label: 'Image', items: [ { label: 'Image Size…', disabled: true }, { label: 'Canvas Size…', disabled: true }, { label: 'Adjustments', disabled: true } ] },
    { label: 'Layer', items: [ { label: 'New', disabled: true }, { label: 'Duplicate Layer', disabled: true }, { label: 'Merge Layers', disabled: true } ] },
    { label: 'Type', items: [ { label: 'Font Preview Size', disabled: true }, { label: 'Language Options', disabled: true } ] },
    { label: 'Select', items: [ { label: 'All', disabled: true }, { label: 'Deselect', disabled: true } ] },
    { label: 'Filter', items: [ { label: 'Filter Gallery', disabled: true } ] },
    { label: '3D', items: [ { label: '3D Workspace', disabled: true } ] },
    { label: 'View', items: [
      { label: 'Zoom In', action: () => setZoom(Math.min(175, zoom + 10)), shortcut: 'Ctrl++' },
      { label: 'Zoom Out', action: () => setZoom(Math.max(40, zoom - 10)), shortcut: 'Ctrl+-' },
      { label: 'Fit on screen', action: () => setZoom(80) },
      { label: 'Next page', action: () => onPage(Math.min(count - 1, index + 1)), shortcut: '→' },
      { label: 'Previous page', action: () => onPage(Math.max(0, index - 1)), shortcut: '←' },
    ] },
    { label: 'Window', items: [
      { label: 'Navigator & Properties', checked: left, action: () => setLeft(!left) },
      { label: 'Character & Layers', checked: right, action: () => setRight(!right) },
      { label: 'Layers', checked: layers, action: () => setLayers(!layers) },
      { label: '', divider: true },
      { label: 'Switch to PowerPoint', action: () => setView('powerpoint') },
      { label: 'Switch to Canva', action: () => setView('canva') },
    ] },
    { label: 'Help', items: [ { label: 'About SFW Reader', action: () => alert('SFW Reader opens local books in familiar-looking workspaces. It is not affiliated with Adobe.') } ] },
  ];
  return <div className="photoshop app-fill">
    <div className="ps-menu-top"><div className="ps-badge">Ps</div><MenuBar entries={menu} className="ps-menubar" /><div className="ps-top-spacer" /><button className="ps-share" disabled>Share</button><Search size={16} /><WindowControls onClose={close} /></div>
    <div className="ps-options"><span className="ps-tool-name"><Type size={19}/><ChevronDown size={12}/></span><span className="ps-divider"/><span className="ps-option-select">{tool === 'Text' ? 'T' : tool}</span>{tool === 'Text' ? <><span className="ps-option-select ps-option-wide">Arial <ChevronDown size={12}/></span><span className="ps-option-select">Regular <ChevronDown size={12}/></span><span className="ps-option-select">25 pt <ChevronDown size={12}/></span><span className="ps-text-align"><AlignLeft size={15}/><AlignLeft size={15}/><AlignLeft size={15}/></span><span className="ps-color-swatch" aria-label="Foreground color"/></> : <><span className="ps-option-select ps-option-wide">Normal <ChevronDown size={12}/></span><span>Opacity: 100%</span></><span className="ps-divider"/><SlidersHorizontal size={17}/><span className="ps-option-select">Smooth</span><div className="ps-spacer" /></div>
    <div className="ps-workspace">
      <aside className="ps-tools" aria-label="Tools">
        {toolIcons.map((Icon, i) => <button title={`${toolNames[i]} tool`} className={`ps-tool ${tool === toolNames[i] ? 'active' : ''}`} key={toolNames[i]} onClick={() => setTool(toolNames[i])}><Icon size={17} strokeWidth={1.8} /></button>)}
        <div className="ps-colors"><span /><span /></div>
      </aside>
      {left && <aside className="ps-left ps-panel-stack">
        <div className="ps-panel"><div className="ps-panel-heading">Navigator <span>☰</span></div><div className="ps-nav-preview">{image && <img src={image} alt="Navigator thumbnail"/>}<div className="ps-nav-viewport"/></div><div className="ps-mini-zoom"><small>{zoom}%</small><input aria-label="Navigator zoom" type="range" min="40" max="175" value={zoom} onChange={e => setZoom(Number(e.target.value))}/></div></div>
        <div className="ps-panel ps-properties"><div className="ps-panel-heading">Properties <span>History　Tool Presets</span></div><div className="ps-prop-title"><Type size={16} /> Type Layer</div><div className="ps-prop-head">⌄　Transform <span>↶</span></div><div className="ps-property-grid"><span>W</span><b>85.15 px</b><span>X</span><b>94.12 px</b><span>H</span><b>64.78 px</b><span>Y</span><b>1394.91 px</b></div><div className="ps-prop-head">⌄　Character</div><div className="ps-fake-input">Roman</div><div className="ps-fake-input">25 pt <span>90%</span></div><div className="ps-fake-input">Aa　　 Metrics</div></div>
      </aside>}
      <main className="ps-document">
        <div className="ps-tabs" role="tablist" aria-label="Open documents">{neighboringPages.map(n => <button key={n} role="tab" aria-selected={index === n} className={index === n ? 'ps-active-tab' : 'ps-other-tab'} onClick={() => onPage(n)}><FileImage size={12}/><span className="ps-tab-label">{documentName.slice(0, 14)}_{String(n + 1).padStart(4, '0')}.psd {index === n ? '@ ' + zoom + '% (RGB/8)' : ''}</span><span className="ps-tab-close" aria-hidden="true">×</span></button>)}</div>
        <div className="ps-canvas-area"><ImageCanvas src={image} zoom={zoom} name={name}/></div>
        <div className="ps-status"><span>{zoom}%</span><span>{dimensions ? `${dimensions.width.toLocaleString()} px × ${dimensions.height.toLocaleString()} px (72 ppi)` : 'Document preview (RGB/8)'}</span><span className="ps-status-page"><Navigation page={index} count={count} onPage={onPage} /></span></div>
      </main>
      {right && <aside className="ps-right ps-panel-stack"><div className="ps-right-icons"><Brush size={18}/><Layers size={18}/><Shapes size={18}/><Sparkles size={18}/></div><div className="ps-right-content"><div className="ps-panel-heading">Character <span>Paragraph　 Glyphs</span></div><div className="ps-right-fields"><span className="ps-fake-input">000 WildWords2 TB</span><span className="ps-fake-input">Roman</span><span className="ps-fake-input">25 pt</span><span className="ps-fake-input">22 pt</span><span className="ps-fake-input">Metrics</span><span className="ps-fake-input">90%</span></div><div className="ps-typography">T　𝑻　T　T̲　T²　T⁄₂<br/> fi　of　∫　Aa　T　1st　½</div><div className="ps-lang">English: UK　　Smooth</div>{layers && <><div className="ps-panel-heading ps-layers-title">Layers <span>Channels</span></div><div className="ps-layer-filters">⌕ Kind　 ▧　 ◧　T</div><div className="ps-layer-filters">Normal　　　　 Opacity: 100%</div><div className="ps-layer-list"><div className="ps-layer selected"><Eye size={13}/><span className="ps-layer-thumb">{image && <img src={image} alt="Current layer thumbnail"/>}</span><span>{documentName.slice(0, 24)}_{String(index + 1).padStart(4, '0')}</span></div><div className="ps-layer"><Eye size={13}/><span className="ps-layer-thumb ps-background-thumb"/><span>Background</span><span className="ps-layer-lock">🔒</span></div></div><div className="ps-layer-footer">🔗　ƒx　 ▣　 ◉　 ▤　⊕</div></>}</div></aside>}
    </div>
  </div>;
}

function PowerPoint({ props }: { props: ComicProps }) {
  const { index, count, image, name, zoom, setZoom, onPage, openFile, close, setView } = props;
  const [tab, setTab] = useState('Home');
  const tabs = ['File', 'Home', 'Insert', 'Draw', 'Design', 'Transitions', 'Animations', 'Slide Show', 'Review', 'View', 'Help'];
  return <div className="powerpoint app-fill"><div className="ppt-titlebar"><span className="ppt-icon">P</span><span>AutoSave <span className="switch-mock">◯</span></span><span className="ppt-title">{name} — PowerPoint</span><WindowControls onClose={close}/></div><div className="ppt-tabs">{tabs.map(t => <button onClick={() => { setTab(t); if (t === 'File') openFile(); }} key={t} className={t === tab ? 'selected' : ''}>{t}</button>)}</div><div className="ppt-ribbon"><div className="ppt-ribbon-tool"><ImageIcon size={23}/><span>Pictures</span></div><div className="ppt-ribbon-tool"><LayoutTemplate size={23}/><span>Layout</span></div><div className="ppt-ribbon-tool"><Plus size={23}/><span>New slide</span></div><div className="ppt-ribbon-sep"/><div className="ppt-ribbon-tool"><Type size={22}/><span>Text box</span></div><div className="ppt-ribbon-tool"><Shapes size={23}/><span>Shapes</span></div><div className="ppt-ribbon-sep"/><div className="ppt-placeholder">Calibri (Body)　⌄<br/>24　 B　 I　 U　 A</div><div className="ppt-ribbon-spacer"/></div>
    <div className="ppt-body"><aside className="ppt-slides"><div className="ppt-side-heading">Slides　⌄</div>{Array.from({ length: Math.min(count, 150) }, (_, i) => <button key={i} onClick={() => onPage(i)} className={`ppt-thumb-row ${index === i ? 'selected' : ''}`}><span>{i + 1}</span><div className="ppt-thumb">{index === i && image ? <img src={image} alt="Selected slide"/> : <FileImage size={24}/>}</div></button>)}</aside><div className="ppt-center"><div className="ppt-slide-wrap"><div className="ppt-slide"><ImageCanvas src={image} zoom={zoom} name={name}/></div></div><div className="ppt-notes">Click to add notes</div></div></div><div className="ppt-bottom"><span>Slide {index + 1} of {count}</span><span className="ppt-bottom-center">English (United States)　Accessibility: Good</span><Navigation page={index} count={count} onPage={onPage}/><button title="Switch to Canva" onClick={() => setView('canva')}>Canva</button><button onClick={() => setZoom(Math.max(40, zoom - 10))}><ZoomOut size={15}/></button><input aria-label="Zoom" type="range" min="40" max="175" value={zoom} onChange={e => setZoom(Number(e.target.value))}/><button onClick={() => setZoom(Math.min(175, zoom + 10))}><ZoomIn size={15}/></button><span>{zoom}%</span></div>
  </div>;
}

function Canva({ props }: { props: ComicProps }) {
  const { index, count, image, name, zoom, setZoom, onPage, openFile, close, setView } = props;
  const [panel, setPanel] = useState('Design');
  const panels = [{ label: 'Design', Icon: LayoutTemplate }, { label: 'Elements', Icon: Shapes }, { label: 'Text', Icon: Type }, { label: 'Uploads', Icon: FolderOpen }, { label: 'Draw', Icon: PenTool }, { label: 'Apps', Icon: Sparkles }];
  return <div className="canva app-fill"><div className="canva-bar"><button onClick={close} title="Back to library"><ArrowLeft size={18}/></button><div className="canva-logo">SFW <b>Design</b></div><button onClick={openFile}>File <ChevronDown size={12}/></button><button disabled>Resize <ChevronDown size={12}/></button><span className="canva-doc-title">{name}</span><span className="canva-saved">✓ All changes saved</span><span className="canva-share">Share</span></div><div className="canva-editor"><aside className="canva-rail">{panels.map(({label,Icon}) => <button className={panel === label ? 'active' : ''} key={label} onClick={() => setPanel(label)}><Icon size={21}/><span>{label}</span></button>)}</aside><aside className="canva-side"><div className="canva-side-head">{panel}<button onClick={() => setPanel('')}><ChevronLeft size={16}/></button></div>{panel === 'Design' ? <><div className="canva-search"><Search size={15}/> Search templates</div><h4>Recently used</h4><div className="canva-template">{image && <img src={image} alt="Current design"/>}</div><h4>Styles</h4><div className="canva-styles"><span/><span/><span/><span/></div></> : <div className="canva-panel-note">Select an element to view its settings.</div>}</aside><div className="canva-main"><div className="canva-options"><span><Sparkles size={16}/> Edit image</span><span><SlidersHorizontal size={16}/> Adjust</span><span><Crop size={16}/> Crop</span><span><Maximize size={16}/> Flip</span></div><div className="canva-stage"><div className="canva-artboard"><ImageCanvas src={image} zoom={zoom} name={name}/></div></div><div className="canva-footer"><button onClick={() => onPage(Math.max(0, index - 1))} disabled={index === 0}><ChevronLeft size={16}/></button><PageSelect count={count} page={index} onPage={onPage} /><button onClick={() => onPage(Math.min(count - 1, index + 1))} disabled={index === count - 1}><ChevronRight size={16}/></button><div className="canva-footer-spacer"/><button onClick={() => setZoom(Math.max(40, zoom - 10))}><ZoomOut size={16}/></button><input aria-label="Zoom" type="range" min="40" max="175" value={zoom} onChange={e => setZoom(Number(e.target.value))}/><span>{zoom}%</span><button onClick={() => setView('photoshop')} title="Switch to Photoshop"><ImageIcon size={16}/></button></div></div></div></div>;
}

export default function ComicApps(props: ComicProps) {
  switch (props.view) {
    case 'photoshop': return <Photoshop props={props}/>;
    case 'powerpoint': return <PowerPoint props={props}/>;
    case 'canva': return <Canva props={props}/>;
  }
}
