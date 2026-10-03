import type { ReactNode } from 'react';
import {
  AlignCenter, AlignJustify, AlignLeft, AlignRight, ArrowDownAZ, ArrowDownUp,
  Bold, ChevronDown, Clipboard, Copy, Eraser, Grid2X2, Highlighter, Italic,
  LayoutGrid, ListFilter, Paintbrush, Percent, Search, Scissors, Sigma,
  Strikethrough, Table2, Trash2, Underline, WandSparkles,
} from 'lucide-react';

// Office-style ribbon is decorative; actual book operations remain in the reader controls.
function Tool({ children, label, className = '' }: {children: ReactNode; label: string; className?: string}) {
  return <span className={'excel-home-tool ' + className} title={label}>{children}</span>;
}
function Group({ children, label, className = '' }: {children: ReactNode; label: string; className?: string}) {
  return <div className={'excel-home-group ' + className}>
    <div className="excel-home-group-body">{children}</div><small className="excel-home-group-label">{label}</small>
  </div>;
}
function Chevron() { return <ChevronDown size={10} strokeWidth={1.6}/>; }

function Home() {
  return <>
    <Group label="Clipboard" className="excel-home-clipboard">
      <Tool label="Paste" className="excel-home-large">
        <Clipboard size={30} color="#be832e" strokeWidth={1.5}/>
        <span>Paste <Chevron/></span>
      </Tool>
      <div className="excel-home-small-stack">
        <Tool label="Cut"><Scissors size={16} color="#608ca8"/></Tool>
        <Tool label="Copy"><Copy size={16} color="#677c90"/><Chevron/></Tool>
        <Tool label="Format Painter"><Paintbrush size={16} color="#ae7f4c"/></Tool>
      </div>
    </Group>

    <Group label="Font" className="excel-home-font">
      <div className="excel-home-two-rows">
        <div className="excel-home-row">
          <span className="excel-home-field excel-home-family">Aptos Narrow <Chevron/></span>
          <span className="excel-home-field excel-home-point">11 <Chevron/></span>
          <Tool label="Increase Font Size"><span className="excel-home-letter">A<sup>↑</sup></span></Tool>
          <Tool label="Decrease Font Size"><span className="excel-home-letter">A<sup>↓</sup></span></Tool>
        </div>
        <div className="excel-home-row excel-home-font-icons">
          <Tool label="Bold"><Bold size={17}/></Tool>
          <Tool label="Italic"><Italic size={17}/></Tool>
          <Tool label="Underline"><Underline size={17}/><Chevron/></Tool>
          <Tool label="Borders"><Grid2X2 size={18} color="#647f91"/><Chevron/></Tool>
          <Tool label="Fill Color"><Highlighter size={19} color="#e3b02a"/><Chevron/></Tool>
          <Tool label="Font Color"><span className="excel-home-red-underline">A</span><Chevron/></Tool>
        </div>
      </div>
    </Group>

    <Group label="Alignment" className="excel-home-alignment">
      <div className="excel-home-two-rows">
        <div className="excel-home-row excel-home-alignment-row">
          <Tool label="Top Align"><span className="excel-home-align-glyph">☰</span></Tool>
          <Tool label="Middle Align"><span className="excel-home-align-glyph">≡</span></Tool>
          <Tool label="Bottom Align"><span className="excel-home-align-glyph">▤</span></Tool>
          <Tool label="Orientation"><span className="excel-home-rotation">A↗</span><Chevron/></Tool>
          <Tool label="Wrap Text" className="excel-home-labeled"><ArrowDownUp size={16} color="#4373a3"/> Wrap Text</Tool>
        </div>
        <div className="excel-home-row excel-home-alignment-row">
          <Tool label="Align Left"><AlignLeft size={17}/></Tool>
          <Tool label="Center"><AlignCenter size={17}/></Tool>
          <Tool label="Align Right"><AlignRight size={17}/></Tool>
          <Tool label="Decrease Indent"><span className="excel-home-indent">⇤≡</span></Tool>
          <Tool label="Increase Indent"><span className="excel-home-indent">≡⇥</span></Tool>
          <Tool label="Merge & Center" className="excel-home-labeled"><Table2 size={16} color="#4b8daf"/> Merge &amp; Center <Chevron/></Tool>
        </div>
      </div>
    </Group>

    <Group label="Number" className="excel-home-number">
      <div className="excel-home-two-rows">
        <div className="excel-home-row"><span className="excel-home-field excel-home-general">General <Chevron/></span></div>
        <div className="excel-home-row excel-home-number-row">
          <Tool label="Accounting Number Format">$ <Chevron/></Tool>
          <Tool label="Percent Style"><Percent size={17}/></Tool>
          <Tool label="Comma Style">,</Tool>
          <Tool label="Decrease Decimal"><span className="excel-home-decimals">.0←</span></Tool>
          <Tool label="Increase Decimal"><span className="excel-home-decimals">→.00</span></Tool>
        </div>
      </div>
    </Group>

    <Group label="Styles" className="excel-home-styles">
      <Tool label="Conditional Formatting" className="excel-home-large">
        <Grid2X2 size={29} color="#c06359"/><span>Conditional <br/>Formatting <Chevron/></span>
      </Tool>
      <Tool label="Format as Table" className="excel-home-large">
        <Table2 size={29} color="#458cbb"/><span>Format as<br/>Table <Chevron/></span>
      </Tool>
      <Tool label="Cell Styles" className="excel-home-large">
        <Paintbrush size={28} color="#508b8a"/><span>Cell<br/>Styles <Chevron/></span>
      </Tool>
    </Group>

    <Group label="Cells" className="excel-home-cells">
      <Tool label="Insert" className="excel-home-large"><LayoutGrid size={29} color="#518cbd"/><span>Insert <Chevron/></span></Tool>
      <Tool label="Delete" className="excel-home-large"><Trash2 size={27} color="#c36862"/><span>Delete <Chevron/></span></Tool>
      <Tool label="Format" className="excel-home-large"><Table2 size={28} color="#548baf"/><span>Format <Chevron/></span></Tool>
    </Group>

    <Group label="Editing" className="excel-home-editing">
      <div className="excel-home-small-stack excel-home-editing-stack">
        <Tool label="AutoSum"><Sigma size={18}/> AutoSum <Chevron/></Tool>
        <Tool label="Fill"><span className="excel-home-indent">▣↓</span> Fill <Chevron/></Tool>
        <Tool label="Clear"><Eraser size={17} color="#ae67a1"/> Clear <Chevron/></Tool>
      </div>
      <Tool label="Sort & Filter" className="excel-home-large">
        <ArrowDownAZ size={29} color="#427f99"/><span>Sort &amp;<br/>Filter <Chevron/></span>
      </Tool>
      <Tool label="Find & Select" className="excel-home-large">
        <Search size={30} strokeWidth={1.6}/><span>Find &amp;<br/>Select <Chevron/></span>
      </Tool>
    </Group>

    <Group label="Sensitivity" className="excel-home-additional">
      <Tool label="Sensitivity" className="excel-home-large"><WandSparkles size={29} color="#3487d2"/><span>Sensitivity <Chevron/></span></Tool>
    </Group>
    <Group label="Add-ins" className="excel-home-additional">
      <Tool label="Add-ins" className="excel-home-large"><Grid2X2 size={29} color="#e87929"/><span>Add-ins</span></Tool>
    </Group>
  </>;
}

const secondary: Record<string, { label: string; tools: { title: string; icon: ReactNode }[] }[]> = {
  Insert: [
    {label: 'Tables', tools: [{title:'PivotTable',icon:<Table2/>},{title:'Table',icon:<Grid2X2/>}]},
    {label: 'Illustrations', tools: [{title:'Pictures',icon:<LayoutGrid/>},{title:'Shapes',icon:<WandSparkles/>}]},
    {label: 'Charts', tools: [{title:'Recommended Charts',icon:<ArrowDownAZ/>},{title:'Column',icon:<Grid2X2/>}]},
  ],
  Data: [
    {label:'Get & Transform Data',tools:[{title:'Get Data',icon:<Table2/>},{title:'Refresh All',icon:<ArrowDownUp/>}]},
    {label:'Sort & Filter',tools:[{title:'Sort',icon:<ArrowDownAZ/>},{title:'Filter',icon:<ListFilter/>}]},
    {label:'Data Tools',tools:[{title:'Text to Columns',icon:<Grid2X2/>},{title:'Remove Duplicates',icon:<Eraser/>}]},
  ],
  Formulas: [
    {label:'Function Library',tools:[{title:'Insert Function',icon:<Sigma/>},{title:'AutoSum',icon:<Sigma/>}]},
    {label:'Defined Names',tools:[{title:'Name Manager',icon:<ListFilter/>},{title:'Define Name',icon:<Grid2X2/>}]},
  ],
  View: [
    {label:'Workbook Views',tools:[{title:'Normal',icon:<Table2/>},{title:'Page Layout',icon:<LayoutGrid/>}]},
    {label:'Show',tools:[{title:'Formula Bar',icon:<Sigma/>},{title:'Gridlines',icon:<Grid2X2/>}]},
  ],
};

export default function ExcelRibbon({ tab }: {tab: string}) {
  if (tab === 'Home') return <div className="excel-ribbon excel-reference-ribbon" aria-label="Excel Home ribbon"><Home/></div>;
  const groups = secondary[tab] ?? [{label: tab, tools: [
    {title:'Options',icon:<Grid2X2/>},{title:'Preferences',icon:<WandSparkles/>},
  ]}];
  return <div className="excel-ribbon excel-reference-ribbon excel-reference-alternative" aria-label={tab+' ribbon'}>
    {groups.map(group => <Group key={group.label} label={group.label} className="excel-home-secondary">
      {group.tools.map(tool => <Tool label={tool.title} className="excel-home-large" key={tool.title}>{tool.icon}<span>{tool.title}</span></Tool>)}
    </Group>)}
  </div>;
}
