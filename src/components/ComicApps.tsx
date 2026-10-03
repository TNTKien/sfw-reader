import { useEffect, useRef, useState } from 'react';
import { AlignCenter, AlignLeft, AlignRight, ArrowLeft, BookOpen, Brush, ChevronDown, ChevronLeft, ChevronRight, Crop, Download, Eraser, Eye, FileImage, FolderOpen, Hand, Image as ImageIcon, Layers, LayoutTemplate, Maximize, MousePointer2, Move, PaintBucket, PanelLeft, PanelRight, PenTool, Pipette, Plus, Search, Settings2, Shapes, SlidersHorizontal, Sparkles, Square, Type, WandSparkles, ZoomIn, ZoomOut, Save, Undo2, Redo2, Bell, Mic, Clipboard, Scissors, Copy, Paintbrush, LayoutGrid, Upload, Lightbulb, Palette, Grid3X3, History, Stamp } from 'lucide-react';
import { MenuBar, PageSelect, WindowControls } from './Chrome';
import PowerPointHomeRibbon from './PowerPointHomeRibbon';
import type { ComicView } from '../types';

export interface ComicProps {
  name: string;
  image: string | null;
  getImage?: (index: number) => Promise<string>;
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

const toolIcons = [Move, Square, MousePointer2, WandSparkles, Crop, Brush, Eraser, PaintBucket, Pipette, PenTool, Type, Hand, ZoomIn];
const toolNames = ['Move', 'Marquee', 'Lasso', 'Magic Wand', 'Crop', 'Brush', 'Eraser', 'Fill', 'Eyedropper', 'Pen', 'Text', 'Hand', 'Zoom'];

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
  const [tool, setTool] = useState('Magic Wand');
  const [left, setLeft] = useState(true);
  const [right, setRight] = useState(true);
  const [layers, setLayers] = useState(true);
  const [psPanel, setPsPanel] = useState<'Character' | 'Paragraph' | 'Glyphs'>('Character');
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
    { label: 'Plugins', items: [{ label: 'Browse Plugins', disabled: true }] },
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
    <div className="ps-menu-top"><div className="ps-badge">Ps</div><MenuBar entries={menu} className="ps-menubar" /><div className="ps-top-spacer" /><WindowControls onClose={close} /></div>
    <div className="ps-options ps-fidelity-options">
      <span className="ps-tool-name">{tool === 'Magic Wand' ? <WandSparkles size={19}/> : tool === 'Text' ? <Type size={19}/> : <MousePointer2 size={19}/>}<ChevronDown size={12}/></span>
      <span className="ps-divider"/>
      {tool === 'Magic Wand' ? <>
        <span className="ps-fidelity-toolgroup"><span className="ps-option-select">Sample Size:</span><span className="ps-option-select ps-option-wide">Point Sample <ChevronDown size={11}/></span></span>
        <span className="ps-fidelity-toolgroup">Tolerance: <span className="ps-fidelity-value">20</span></span>
        <label className="ps-fidelity-check"><input type="checkbox" defaultChecked/>Anti-alias</label>
        <label className="ps-fidelity-check"><input type="checkbox" defaultChecked/>Contiguous</label>
        <label className="ps-fidelity-check"><input type="checkbox" defaultChecked/>Sample All Layers</label>
        <span className="ps-fidelity-command">Select Subject</span><span className="ps-fidelity-command">Select and Mask…</span>
      </> : tool === 'Text' ? <>
        <span className="ps-option-select ps-option-wide">BackIssue BB <ChevronDown size={11}/></span>
        <span className="ps-option-select">Regular <ChevronDown size={11}/></span>
        <span className="ps-option-select">43 pt <ChevronDown size={11}/></span>
        <span className="ps-text-align"><AlignLeft size={15}/><AlignCenter size={15}/><AlignRight size={15}/></span>
        <span className="ps-color-swatch" aria-label="Foreground color"/>
      </> : <><span className="ps-option-select">{tool}</span><span className="ps-option-select ps-option-wide">Normal <ChevronDown size={11}/></span><span>Opacity: 100%</span></>}
      <div className="ps-spacer"/>
      <div className="ps-fidelity-utilities" aria-label="Photoshop window utilities">
        <span title="Share"><Upload size={17}/></span>
        <span title="Notifications"><Bell size={17}/></span>
        <span title="Search"><Search size={17}/></span>
        <span title="Discover"><Lightbulb size={18}/></span>
        <span title="Workspace"><LayoutGrid size={17}/><ChevronDown size={10}/></span>
        <span className="ps-account-orb" title="Profile"/>
      </div>
    </div>
    <div className="ps-workspace">
      <aside className="ps-tools" aria-label="Tools">
        {toolIcons.map((Icon, i) => <button title={`${toolNames[i]} tool`} className={`ps-tool ${tool === toolNames[i] ? 'active' : ''}`} key={toolNames[i]} onClick={() => setTool(toolNames[i])}><Icon size={17} strokeWidth={1.8} /></button>)}
        <div className="ps-colors"><span /><span /></div>
      </aside>
      {left && <aside className="ps-left ps-panel-stack">
        <div className="ps-panel"><div className="ps-panel-heading">Navigator <span>TypeR　 ☰</span></div><div className="ps-nav-preview">{image && <img src={image} alt="Navigator thumbnail"/>}<div className="ps-nav-viewport"/></div><div className="ps-mini-zoom"><small>{zoom}%</small><input aria-label="Navigator zoom" type="range" min="40" max="175" value={zoom} onChange={e => setZoom(Number(e.target.value))}/></div></div>
        <div className="ps-panel ps-properties"><div className="ps-panel-heading">Properties <span>History　Tool Presets</span></div><div className="ps-prop-title"><Layers size={16}/> Pixel Layer</div>
          <div className="ps-prop-head">⌄　Transform <span>↶</span></div>
          <div className="ps-property-grid">
            <span>W</span><b>{dimensions?.width ?? '—'} px</b><span>X</span><b>0 px</b>
            <span>H</span><b>{dimensions?.height ?? '—'} px</b><span>Y</span><b>0 px</b>
          </div>
          <div className="ps-prop-head">⌄　Align and Distribute</div>
          <div className="ps-fidelity-align">⊣　⊢　⊤　⊥　≡　⇥</div>
          <div className="ps-prop-head">⌄　Quick Actions</div>
          <span className="ps-fidelity-action">Remove Background</span></div>
      </aside>}
      <main className="ps-document">
        <div className="ps-tabs" role="tablist" aria-label="Open documents">{neighboringPages.map(n => <button key={n} role="tab" aria-selected={index === n} className={index === n ? 'ps-active-tab' : 'ps-other-tab'} onClick={() => onPage(n)}><FileImage size={12}/><span className="ps-tab-label">{String(n + 1).padStart(2, '0')}.psd {index === n ? '@ ' + zoom + '% (Background, Gray/8)' : ''}</span><span className="ps-tab-close" aria-hidden="true">×</span></button>)}</div>
        <div className="ps-canvas-area"><ImageCanvas src={image} zoom={zoom} name={name}/></div>
        <div className="ps-status"><span>{zoom}%</span><span>{dimensions ? `${dimensions.width.toLocaleString()} px × ${dimensions.height.toLocaleString()} px (72 ppi)` : 'Document preview (RGB/8)'}</span><span className="ps-status-page"><Navigation page={index} count={count} onPage={onPage} /></span></div>
      </main>
      {right && <aside className="ps-right ps-panel-stack">
        <nav className="ps-right-icons" aria-label="Photoshop panels">
          <span title="Color"><Palette size={18}/></span>
          <span title="Swatches"><Grid3X3 size={18}/></span>
          <span className="ps-rail-break"/>
          <span title="Brushes"><Brush size={19}/></span>
          <span title="Brush Settings"><SlidersHorizontal size={18}/></span>
          <span className="ps-rail-break"/>
          <span title="Clone Source"><Stamp size={18}/></span>
          <span title="History"><History size={18}/></span>
          <span className="ps-rail-break"/>
          <span title="Adjustments"><Settings2 size={18}/></span>
          <span title="Properties"><Sparkles size={18}/></span>
        </nav>
        <div className="ps-right-content">
          <div className="ps-sidebar-tabs" role="tablist" aria-label="Typography panels">
            {(['Character','Paragraph','Glyphs'] as const).map(label=>
              <button type="button" key={label} role="tab" aria-selected={psPanel === label}
                className={psPanel === label ? 'ps-sidebar-tab active' : 'ps-sidebar-tab'}
                onClick={()=>setPsPanel(label)}>{label}</button>)}
            <span className="ps-panel-menu" aria-hidden="true">☰</span>
          </div>
          {psPanel === 'Character' ? <>
            <div className="ps-right-fields"><span className="ps-fake-input">000 WildWords2 TB</span><span className="ps-fake-input">Roman</span><span className="ps-fake-input">25 pt</span><span className="ps-fake-input">22 pt</span><span className="ps-fake-input">Metrics</span><span className="ps-fake-input">90%</span></div>
            <div className="ps-typography">T　𝑻　T　T̲　T²　T⁄₂<br/> fi　of　∫　Aa　T　1st　½</div>
            <div className="ps-lang">English: UK　　Smooth</div>
          </> : psPanel === 'Paragraph' ?
            <div className="ps-paragraph-panel">
              <div className="ps-paragraph-alignment"><AlignLeft size={19}/><AlignCenter size={19}/><AlignRight size={19}/></div>
              <div className="ps-paragraph-justified">☰　☷　☵　≡</div>
              <div className="ps-paragraph-settings">Indent:　0 pt　　Spacing:　0 pt</div>
            </div> :
            <div className="ps-glyph-panel"><div className="ps-fake-input">000 WildWords2 TB　⌄</div><div className="ps-glyph-grid">{'A B C D E F G H I J K L M N O P'.split(' ').map(l=><span key={l}>{l}</span>)}</div></div>}
          {layers && <>
            <div className="ps-sidebar-tabs ps-layer-tabs"><strong>Layers</strong><span>Channels</span><span>Paths</span><span className="ps-panel-menu">☰</span></div>
            <div className="ps-layer-filters">⌕ Kind　 ▧　 ◧　T</div>
            <div className="ps-layer-filters">Normal　　　　 Opacity: 100%</div>
            <div className="ps-layer-list">
              {['Type Layer 3', 'Type Layer 2', 'Type Layer 1'].map((layer, i)=><div className="ps-layer ps-fidelity-type-layer" key={layer}><Eye size={13}/><Type size={15}/><span>{layer}</span>{i===0 && <span className="ps-fidelity-fx">ƒx</span>}</div>)}
              <div className="ps-layer"><Eye size={13}/><span className="ps-layer-thumb ps-background-thumb"/><span>Image layer</span></div>
              <div className="ps-layer selected"><Eye size={13}/><span className="ps-layer-thumb">{image && <img src={image} alt="Current layer thumbnail"/>}</span><span>Background</span><span className="ps-layer-lock">⌑</span></div>
            </div>
            <div className="ps-layer-footer">🔗　ƒx　 ▣　 ◉　 ▤　⊕</div>
          </>}
        </div>
      </aside>}
    </div>
  </div>;
}

function SlideThumbnail({ page, active, activeImage, getImage }: {
  page: number;
  active: boolean;
  activeImage: string | null;
  getImage?: (index: number) => Promise<string>;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const container = useRef<HTMLDivElement>(null);
  // Decode only thumbnails that approach the visible slides pane, not every page.
  useEffect(() => {
    if (active || !getImage || preview || !container.current) return;
    let live = true;
    let requested = false;
    const node = container.current;
    const observer = new IntersectionObserver(entries => {
      if (!requested && entries.some(entry => entry.isIntersecting)) {
        requested = true;
        observer.disconnect();
        getImage(page).then(src => { if (live) setPreview(src); }).catch(() => {});
      }
    }, { root: node.closest('.ppt-slides'), rootMargin: '120px 0px' });
    observer.observe(node);
    return () => { live = false; observer.disconnect(); };
  }, [active, getImage, page, preview]);
  const display = active ? activeImage : preview;
  return <div ref={container} className={active ? 'ppt-thumb ppt-thumb-active' : 'ppt-thumb'}>
    {display ? <img loading="lazy" src={display} alt={`Slide ${page + 1} thumbnail`}/> :
      <div className="ppt-thumbnail-placeholder"><FileImage size={18}/><small>{page + 1}</small></div>}
  </div>;
}

function PowerPoint({ props }: { props: ComicProps }) {
  const { index, count, image, getImage, name, zoom, setZoom, onPage, openFile, close } = props;
  const [tab, setTab] = useState('Home');
  const tabs = ['File', 'Home', 'Insert', 'Draw', 'Design', 'Transitions', 'Animations', 'Slide Show', 'Record', 'Review', 'View', 'Help', 'Shape Format'];
  const ribbon = tab === 'Insert' ? [
    { Icon: LayoutTemplate, title: 'New Slide', group: 'Slides' },
    { Icon: ImageIcon, title: 'Pictures', group: 'Images' },
    { Icon: Shapes, title: 'Shapes', group: 'Illustrations' },
    { Icon: Type, title: 'Text Box', group: 'Text' },
  ] : tab === 'Design' ? [
    { Icon: LayoutTemplate, title: 'Themes', group: 'Themes' },
    { Icon: ImageIcon, title: 'Variants', group: 'Variants' },
    { Icon: Maximize, title: 'Slide Size', group: 'Customize' },
  ] : tab === 'View' ? [
    { Icon: LayoutTemplate, title: 'Normal', group: 'Presentation Views' },
    { Icon: ImageIcon, title: 'Slide Sorter', group: 'Presentation Views' },
    { Icon: Maximize, title: 'Fit to Window', group: 'Zoom' },
  ] : [
    { Icon: LayoutTemplate, title: 'New Slide', group: 'Slides' },
    { Icon: Type, title: 'Font', group: 'Font' },
    { Icon: AlignLeft, title: 'Paragraph', group: 'Paragraph' },
    { Icon: Shapes, title: 'Drawing', group: 'Drawing' },
  ];
  return <div className="powerpoint app-fill">
    <div className="ppt-titlebar">
      <span className="ppt-icon">P</span>
      <span className="ppt-autosave">AutoSave <span>On</span></span>
      <span className="ppt-quick-access"><Save size={17}/><Undo2 size={16}/><Redo2 size={16}/></span>
      <span className="ppt-title">{name.replace(/\.[^.]+$/, '')}.pptx <span className="ppt-fidelity-general">◇ General</span></span>
      <span className="ppt-title-search"><Search size={15}/> Search</span><span className="ppt-fidelity-avatar">R</span>
      <WindowControls onClose={close}/>
    </div>
    <div className="ppt-tabs">{tabs.map(t => <button onClick={() => setTab(t)} key={t} className={t === tab ? 'selected' : ''}>{t}</button>)}<div className="ppt-fidelity-tab-actions"><span className="ppt-fidelity-comment"><BookOpen size={14}/> Comments</span><span className="ppt-fidelity-share">⇧ Share ⌄</span></div></div>
    {tab === 'File' ? <main className="ppt-backstage"><aside><b>File</b><button onClick={() => setTab('Home')}>← Back</button><button onClick={openFile}>Open</button><button onClick={() => setTab('Home')}>Info</button></aside><section><h2>Open</h2><p>Recent</p><button onClick={openFile}><FolderOpen size={18}/> Browse files on this device</button></section></main> : <>
      <div className="ppt-ribbon ppt-fidelity-ribbon">
        {tab === 'Home' || tab === 'Shape Format' ?
          <PowerPointHomeRibbon/> :
          ribbon.map((item, i) => <div className="ppt-ribbon-group" key={item.title}>
            {i > 0 && <div className="ppt-ribbon-sep"/>}
            <div className="ppt-ribbon-tool"><item.Icon size={23}/><span>{item.title}</span></div>
            <small>{item.group}</small>
          </div>)}
      </div>
      <div className="ppt-body">
        <aside className="ppt-slides"><div className="ppt-side-heading"><span>Slides</span> <span>Outline</span></div>
          {Array.from({ length: Math.min(count, 150) }, (_, i) =>
            <button key={i} onClick={() => onPage(i)} className={`ppt-thumb-row ${index === i ? 'selected' : ''}`} aria-label={`Go to slide ${i + 1}`}>
              <span>{i + 1}</span><SlideThumbnail page={i} active={index === i} activeImage={image} getImage={getImage}/>
            </button>)}
        </aside>
        <div className="ppt-center"><div className="ppt-slide-wrap"><div className="ppt-slide"><ImageCanvas src={image} zoom={zoom} name={name}/></div></div><div className="ppt-notes"><span>Notes</span><span className="ppt-notes-hint">Click to add notes</span></div></div>
      </div>
      <div className="ppt-bottom"><span>Slide {index + 1} of {count}</span><span className="ppt-bottom-center">English (United States)　 <span className="ppt-status-accessibility">✓ Accessibility: Good</span></span>
        <Navigation page={index} count={count} onPage={onPage}/>
        <button aria-label="Fit slide" title="Fit slide" onClick={() => setZoom(80)}><Maximize size={14}/></button>
        <button aria-label="Zoom out" onClick={() => setZoom(Math.max(40, zoom - 10))}><ZoomOut size={15}/></button>
        <input aria-label="Zoom" type="range" min="40" max="175" value={zoom} onChange={e => setZoom(Number(e.target.value))}/>
        <button aria-label="Zoom in" onClick={() => setZoom(Math.min(175, zoom + 10))}><ZoomIn size={15}/></button><span>{zoom}%</span>
      </div>
    </>}
  </div>;
}

function Canva({ props }: { props: ComicProps }) {
  const { index, count, image, name, zoom, setZoom, onPage, openFile, close } = props;
  const [panel, setPanel] = useState('Design');
  const panels = [
    { label: 'Design', Icon: LayoutTemplate }, { label: 'Elements', Icon: Shapes },
    { label: 'Text', Icon: Type }, { label: 'Uploads', Icon: FolderOpen },
    { label: 'Draw', Icon: PenTool }, { label: 'Apps', Icon: Sparkles },
  ];
  const panelContent = panel === 'Design' ? <>
    <div className="canva-search"><Search size={15}/> Search templates</div>
    <div className="canva-side-subtitle">Recently used <span>See all</span></div>
    <div className="canva-recent-grid"><div className="canva-template">{image && <img src={image} alt="Current design"/>}</div><div className="canva-template canva-blank-template"><LayoutTemplate size={28}/></div></div>
    <div className="canva-side-subtitle">Styles</div><div className="canva-styles"><span/><span/><span/><span/></div>
    <div className="canva-side-subtitle">Layouts</div><div className="canva-layout-grid"><span/><span/><span/><span/></div>
  </> : panel === 'Elements' ? <>
    <div className="canva-search"><Search size={15}/> Search elements</div>
    <div className="canva-side-subtitle">Recently used</div><div className="canva-elements-grid"><span>●</span><span>▢</span><span>△</span><span>★</span><span>➜</span><span>◆</span></div>
    <div className="canva-side-subtitle">Lines & shapes</div><div className="canva-elements-grid"><span>◯</span><span>▭</span><span>⬡</span><span>⬟</span></div>
  </> : panel === 'Text' ? <>
    <div className="canva-search"><Search size={15}/> Search text</div>
    <div className="canva-text-panel"><div>Add a text box</div><strong>Add a heading</strong><b>Add a subheading</b><span>Add a little bit of body text</span></div>
  </> : panel === 'Uploads' ? <>
    <button className="canva-upload-button" onClick={openFile}><FolderOpen size={16}/> Upload files</button>
    <div className="canva-side-subtitle">Images</div><div className="canva-uploaded">{image && <img src={image} alt="Current page"/>}</div>
  </> : panel === 'Draw' ? <>
    <div className="canva-side-subtitle">Drawing tools</div><div className="canva-draw-tools"><PenTool/><Brush/><SlidersHorizontal/></div>
    <div className="canva-side-subtitle">Colors</div><div className="canva-styles"><span/><span/><span/><span/></div>
  </> : panel === 'Apps' ? <>
    <div className="canva-search"><Search size={15}/> Search apps</div>
    <div className="canva-elements-grid canva-app-tiles"><span>▥</span><span>▦</span><span>✦</span><span>◉</span></div>
  </> : null;
  return <div className="canva app-fill">
    <div className="canva-bar">
      <button onClick={close} title="Back to library"><ArrowLeft size={18}/></button>
      <div className="canva-logo">Canva</div><span className="canva-top-divider"/>
      <button onClick={openFile}>File <ChevronDown size={12}/></button>
      <button disabled>Resize <ChevronDown size={12}/></button>
      <span className="canva-doc-title" title={name}>{name.replace(/\.[^.]+$/, '')}</span><span className="canva-history"><Undo2 size={15}/><Redo2 size={15}/></span>
      <span className="canva-saved">☁ <span>All changes saved</span></span>
      <span className="canva-avatar">R</span>
      <span className="canva-share">Share</span>
    </div>
    <div className="canva-editor">
      <aside className="canva-rail">{panels.map(({label, Icon}) => <button className={panel === label ? 'active' : ''} key={label} onClick={() => setPanel(panel === label ? '' : label)} aria-label={label}><Icon size={21}/><span>{label}</span></button>)}</aside>
      {panel && <aside className="canva-side"><div className="canva-side-head">{panel}<button onClick={() => setPanel('')} aria-label="Collapse sidebar"><ChevronLeft size={16}/></button></div>{panelContent}</aside>}
      <div className="canva-main">
        <div className="canva-options">
          <span><Sparkles size={16}/> Edit image</span><span><SlidersHorizontal size={16}/> Adjust</span>
          <span><Crop size={16}/> Crop</span><span><Maximize size={16}/> Flip</span>
          <span className="canva-options-right">Position <ChevronDown size={12}/></span><span className="canva-top-more">⋯</span>
        </div>
        <div className="canva-stage">
          <div className="canva-work-area"><div className="canva-page-heading"><span>Page {index + 1} — {name.slice(0, 30)}</span><span>•••</span></div>
            <div className="canva-artboard"><ImageCanvas src={image} zoom={zoom} name={name}/></div>
            <div className="canva-page-actions"><button onClick={() => onPage(Math.max(0,index - 1))} disabled={index === 0}>‹ Previous page</button><span>Page {index + 1} of {count}</span><button onClick={() => onPage(Math.min(count - 1,index + 1))} disabled={index === count - 1}>Next page ›</button></div>
          </div>
        </div>
        <div className="canva-footer">
          <button aria-label="Previous page" onClick={() => onPage(Math.max(0,index - 1))} disabled={index === 0}><ChevronLeft size={16}/></button>
          <PageSelect count={count} page={index} onPage={onPage}/>
          <button aria-label="Next page" onClick={() => onPage(Math.min(count - 1,index + 1))} disabled={index === count - 1}><ChevronRight size={16}/></button>
          <div className="canva-footer-spacer"/><button title="Zoom out" onClick={() => setZoom(Math.max(40,zoom - 10))}><ZoomOut size={16}/></button>
          <input aria-label="Zoom" type="range" min="40" max="175" value={zoom} onChange={e => setZoom(Number(e.target.value))}/>
          <span>{zoom}%</span><button title="Fit" onClick={() => setZoom(80)}><Maximize size={15}/></button>
        </div>
      </div>
    </div>
  </div>;
}

export default function ComicApps(props: ComicProps) {
  switch (props.view) {
    case 'photoshop': return <Photoshop props={props}/>;
    case 'powerpoint': return <PowerPoint props={props}/>;
    case 'canva': return <Canva props={props}/>;
  }
}
