import {
  AlignCenter, AlignJustify, AlignLeft, AlignRight, ArrowDownAZ, ArrowDownUp,
  Bold, Brush, Calculator, ChevronDown, Clipboard, Copy, Grid2X2, Highlighter,
  Italic, LayoutTemplate, List, ListOrdered, Mic, PaintBucket, Paintbrush,
  RotateCcw, Search, Scissors, Shapes, ShieldCheck, Sigma, Sparkles,
  Strikethrough, Underline, WandSparkles,
} from 'lucide-react';

// Decorative Office-style ribbon. File and chapter operations stay in the reader UI.
function Tool({ children, label, className = '' }: { children: React.ReactNode; label: string; className?: string }) {
  return <span className={'ppt-home-tool ' + className} title={label}>{children}</span>;
}
function Group({ children, label, className = '' }: { children: React.ReactNode; label: string; className?: string }) {
  return <div className={'ppt-home-group ' + className}><div className="ppt-home-group-inner">{children}</div><small className="ppt-home-group-label">{label}</small></div>;
}

export default function PowerPointHomeRibbon() {
  return <div className="ppt-home-ribbon" aria-label="PowerPoint ribbon">
    <Group label="Clipboard" className="ppt-home-clipboard">
      <Tool label="Paste" className="ppt-home-tall"><Clipboard size={30} strokeWidth={1.55} color="#d68c41"/><span>Paste <ChevronDown size={10}/></span></Tool>
      <div className="ppt-home-mini-column">
        <Tool label="Cut"><Scissors size={16}/></Tool>
        <Tool label="Copy"><Copy size={16}/></Tool>
        <Tool label="Format Painter"><Paintbrush size={16}/></Tool>
      </div>
    </Group>

    <Group label="Slides" className="ppt-home-slides">
      <Tool label="New Slide" className="ppt-home-tall"><LayoutTemplate size={29} strokeWidth={1.6} color="#568e76"/><span>New Slide <ChevronDown size={10}/></span></Tool>
      <div className="ppt-home-mini-column ppt-home-named-tools">
        <Tool label="Layout"><LayoutTemplate size={15}/>Layout<ChevronDown size={10}/></Tool>
        <Tool label="Reset"><RotateCcw size={15}/>Reset</Tool>
        <Tool label="Section"><Grid2X2 size={15}/>Section<ChevronDown size={10}/></Tool>
      </div>
    </Group>

    <Group label="Font" className="ppt-home-font">
      <div className="ppt-home-font-top">
        <span className="ppt-home-input ppt-home-font-family">Calibri <ChevronDown size={12}/></span>
        <span className="ppt-home-input ppt-home-font-size">24 <ChevronDown size={12}/></span>
        <Tool label="Increase Font Size"><span className="ppt-home-aa">A<sup>↑</sup></span></Tool>
        <Tool label="Decrease Font Size"><span className="ppt-home-aa">A<sup>↓</sup></span></Tool>
        <Tool label="Clear Formatting"><WandSparkles size={17} color="#9b65ba"/></Tool>
      </div>
      <div className="ppt-home-font-bottom">
        <Tool label="Bold"><Bold size={15}/></Tool>
        <Tool label="Italic"><Italic size={15}/></Tool>
        <Tool label="Underline"><Underline size={15}/><ChevronDown size={9}/></Tool>
        <Tool label="Strikethrough"><Strikethrough size={15}/></Tool>
        <Tool label="Character Spacing"><span className="ppt-home-aa-small">AV</span><ChevronDown size={9}/></Tool>
        <Tool label="Change Case"><span className="ppt-home-aa-small">Aa</span><ChevronDown size={9}/></Tool>
        <Tool label="Text Highlight Color"><Highlighter size={17} color="#dbad25"/></Tool>
        <Tool label="Font Color"><span className="ppt-home-font-color">A</span><ChevronDown size={9}/></Tool>
      </div>
    </Group>

    <Group label="Paragraph" className="ppt-home-paragraph">
      <div className="ppt-home-para-row">
        <Tool label="Bullets"><List size={17}/><ChevronDown size={9}/></Tool>
        <Tool label="Numbering"><ListOrdered size={17}/><ChevronDown size={9}/></Tool>
        <Tool label="Decrease List Level"><span className="ppt-home-indent">←≡</span></Tool>
        <Tool label="Increase List Level"><span className="ppt-home-indent">≡→</span></Tool>
        <Tool label="Line Spacing"><ArrowDownUp size={17}/><ChevronDown size={9}/></Tool>
      </div>
      <div className="ppt-home-para-row">
        <Tool label="Align Left"><AlignLeft size={17}/></Tool>
        <Tool label="Center"><AlignCenter size={17}/></Tool>
        <Tool label="Align Right"><AlignRight size={17}/></Tool>
        <Tool label="Justify"><AlignJustify size={17}/></Tool>
        <Tool label="Text Direction"><span className="ppt-home-indent">↳↵</span><ChevronDown size={9}/></Tool>
        <Tool label="Columns"><span className="ppt-home-indent">▥</span></Tool>
      </div>
    </Group>

    <Group label="Drawing" className="ppt-home-drawing">
      <Tool label="Shapes" className="ppt-home-tall"><Shapes size={31} color="#bd5c35" strokeWidth={1.7}/><span>Shapes <ChevronDown size={10}/></span></Tool>
      <Tool label="Arrange" className="ppt-home-tall"><Grid2X2 size={28} color="#b5793a" strokeWidth={1.6}/><span>Arrange <ChevronDown size={10}/></span></Tool>
      <Tool label="Quick Styles" className="ppt-home-tall"><Brush size={28} color="#6382a0" strokeWidth={1.65}/><span>Quick Styles <ChevronDown size={10}/></span></Tool>
      <div className="ppt-home-mini-column">
        <Tool label="Shape Fill"><PaintBucket size={16}/></Tool>
        <Tool label="Shape Outline"><Highlighter size={16}/></Tool>
        <Tool label="Shape Effects"><Sparkles size={16}/></Tool>
      </div>
    </Group>

    <Group label="Editing" className="ppt-home-editing">
      <div className="ppt-home-mini-column ppt-home-named-tools">
        <Tool label="Find and Replace"><Search size={16}/>Find and Replace</Tool>
        <Tool label="Replace Fonts"><span className="ppt-home-letter">A</span>Replace Fonts</Tool>
        <Tool label="Select"><span className="ppt-home-letter">↖</span>Select<ChevronDown size={10}/></Tool>
      </div>
    </Group>

    <Group label="Voice" className="ppt-home-single"><Tool label="Dictate" className="ppt-home-tall"><Mic size={27} color="#488cb9"/><span>Dictate<ChevronDown size={10}/></span></Tool></Group>
    <Group label="Sensitivity" className="ppt-home-single"><Tool label="Sensitivity" className="ppt-home-tall"><ShieldCheck size={26} color="#268abe"/><span>Sensitivity<ChevronDown size={10}/></span></Tool></Group>
    <Group label="Add-ins" className="ppt-home-single"><Tool label="Add-ins" className="ppt-home-tall"><Grid2X2 size={27} color="#e77732"/><span>Add-ins</span></Tool></Group>
    <Group label="Designer" className="ppt-home-single"><Tool label="Designer" className="ppt-home-tall"><Sparkles size={29} color="#bd924e"/><span>Designer</span></Tool></Group>
    <Group label="MathType" className="ppt-home-single"><Tool label="MathType" className="ppt-home-tall"><Calculator size={27} color="#cb3561"/><span>MathType</span></Tool></Group>
  </div>;
}
