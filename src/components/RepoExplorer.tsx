import { useMemo, useState } from 'react';
import { BookOpen, ChevronDown, ChevronRight, ChevronsDownUp, FilePlus2, FolderPlus, MoreHorizontal, RefreshCcw } from 'lucide-react';
import { repositoryFiles } from '../generated/repositoryFiles';

interface Node {
  name: string;
  path: string;
  folder: boolean;
  children: Node[];
}

function buildTree(paths: string[]): Node[] {
  const root: Node = { name: '', path: '', folder: true, children: [] };
  for (const path of paths) {
    let current = root;
    const parts = path.split('/');
    parts.forEach((name, i) => {
      const segment = parts.slice(0, i + 1).join('/');
      let next = current.children.find(child => child.name === name);
      if (!next) {
        next = { name, path: segment, folder: i !== parts.length - 1, children: [] };
        current.children.push(next);
      }
      current = next;
    });
  }
  const sort = (nodes: Node[]) => {
    nodes.sort((a, b) => Number(b.folder) - Number(a.folder) || a.name.localeCompare(b.name, 'en'));
    nodes.forEach(node => sort(node.children));
  };
  sort(root.children);
  return root.children;
}

const defaultExpanded = () => new Set(['', 'src', 'src/components', 'src/lib']);
const allNodes = buildTree(repositoryFiles);
function FileGlyph({ name }: { name: string }) {
  const ext = name.split('.').at(-1)?.toLowerCase();
  const isReact = ext === 'tsx' || ext === 'jsx';
  const cls = isReact ? 'react' : ext === 'ts' ? 'typescript' : ext === 'json' ? 'json'
    : ext === 'css' ? 'css' : ext === 'md' ? 'markdown' : ext === 'svg' ? 'svg'
    : ext === 'yml' || ext === 'yaml' ? 'yaml' : ext === 'html' ? 'html'
    : name === 'bun.lock' ? 'lock' : 'default';
  const icon = isReact ? '⚛' : ext === 'ts' ? 'TS' : ext === 'json' ? '{}' : ext === 'css' ? '#'
    : ext === 'md' ? 'M↓' : ext === 'svg' ? '◇' : ext === 'yml' ? '◆'
    : ext === 'html' ? '5' : name === 'bun.lock' ? 'B' : '▤';
  return <span aria-hidden="true" className={'vsc-tree-glyph vsc-glyph-' + cls}>{icon}</span>;
}

export default function RepoExplorer({ selectedPath, onFile, chapterTitle, onStory }: {
  selectedPath: string | null;
  onFile: (path: string) => void;
  chapterTitle: string;
  onStory: () => void;
}) {
  const nodes = useMemo(() => allNodes, []);
  const [expanded, setExpanded] = useState<Set<string>>(defaultExpanded);
  const [outlineOpen, setOutlineOpen] = useState(true);
  const [timelineOpen, setTimelineOpen] = useState(false);

  const toggle = (path: string) => {
    setExpanded(previous => {
      const next = new Set(previous);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  function renderNodes(items: Node[], depth = 0): React.ReactNode {
    return items.map(node => <div key={node.path}>
      <button type="button"
        className={'vsc-tree-row' + (selectedPath === node.path ? ' selected' : '')}
        style={{ paddingLeft: 9 + depth * 15 }}
        aria-expanded={node.folder ? expanded.has(node.path) : undefined}
        title={node.path}
        onClick={() => node.folder ? toggle(node.path) : onFile(node.path)}>
        {node.folder ? expanded.has(node.path) ? <ChevronDown size={14}/> : <ChevronRight size={14}/> : <span className="vsc-tree-indent"/>}
        {node.folder ? <span aria-hidden="true" className={'vsc-folder-glyph' + (expanded.has(node.path) ? ' is-open' : '')}>▰</span> : <FileGlyph name={node.name}/>}
        <span className="vsc-tree-name">{node.name}</span>
      </button>
      {node.folder && expanded.has(node.path) && renderNodes(node.children, depth + 1)}
    </div>);
  }

  return <div className="vsc-explorer-inner">
    <div className="vsc-explorer-header">EXPLORER <MoreHorizontal size={16}/></div>
    <div className="vsc-open-editors">
      <div className="vsc-open-editors-title">⌄　OPEN EDITORS <span>1</span></div>
      <button type="button" className="vsc-open-editor-story" onClick={onStory}>
        <BookOpen size={14} color="#d0aa61"/> reading-notes.md <span>◉</span>
      </button>
    </div>
    <div className="vsc-repo-heading">
      <button type="button" onClick={() => toggle('')} className="vsc-repo-toggle" aria-expanded={expanded.has('')}>
        {expanded.has('') ? <ChevronDown size={15}/> : <ChevronRight size={15}/>}<b>sfw-reader</b>
      </button>
      <div className="vsc-repo-actions">
        <button type="button" title="New file (read-only)" disabled><FilePlus2 size={16}/></button>
        <button type="button" title="New folder (read-only)" disabled><FolderPlus size={16}/></button>
        <button type="button" title="Refresh tree" onClick={() => setExpanded(defaultExpanded())}><RefreshCcw size={15}/></button>
        <button type="button" title="Collapse all folders" onClick={() => setExpanded(new Set(['']))}><ChevronsDownUp size={15}/></button>
      </div>
    </div>
    <div className="vsc-tree-scroll" role="tree" aria-label="Files in sfw-reader">
      {expanded.has('') && renderNodes(nodes)}
    </div>
    <div className="vsc-explorer-lower">
      <button className="vsc-section-toggle" type="button" onClick={() => setOutlineOpen(v => !v)}>
        {outlineOpen ? <ChevronDown size={14}/> : <ChevronRight size={14}/>} OUTLINE
      </button>
      {outlineOpen && <div className="vsc-outline-item"><BookOpen size={14}/>{chapterTitle}</div>}
      <button className="vsc-section-toggle" type="button" onClick={() => setTimelineOpen(v => !v)}>
        {timelineOpen ? <ChevronDown size={14}/> : <ChevronRight size={14}/>} TIMELINE
      </button>
      {timelineOpen && <div className="vsc-outline-item">Local workspace</div>}
    </div>
  </div>;
}
