import { useEffect, useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

export interface MenuAction {
  label: string;
  shortcut?: string;
  disabled?: boolean;
  divider?: boolean;
  checked?: boolean;
  action?: () => void;
}

export function MenuBar({ entries, className = '' }: {
  entries: { label: string; items: MenuAction[] }[];
  className?: string;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const element = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const closeOnOutside = (event: PointerEvent) => {
      if (element.current && !element.current.contains(event.target as Node)) setOpen(null);
    };
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(null); };
    window.addEventListener('pointerdown', closeOnOutside);
    window.addEventListener('keydown', closeOnEscape);
    return () => { window.removeEventListener('pointerdown', closeOnOutside); window.removeEventListener('keydown', closeOnEscape); };
  }, []);
  return <div className={`menu-bar ${className}`} ref={element}>
    {entries.map(entry => <div className="menu-wrap" key={entry.label}>
      <button className={`menu-trigger ${open === entry.label ? 'is-open' : ''}`}
        onClick={() => setOpen(v => v === entry.label ? null : entry.label)}
        onMouseEnter={() => { if (open) setOpen(entry.label); }}
        aria-expanded={open === entry.label}>
        {entry.label}
      </button>
      {open === entry.label && <div className="menu-dropdown" role="menu">
        {entry.items.map((item, i) => item.divider
          ? <div key={i} className="menu-separator" />
          : <button role="menuitem" key={`${item.label}-${i}`} disabled={item.disabled}
              onClick={() => { setOpen(null); item.action?.(); }} className="menu-option">
              <span className="menu-check">{item.checked ? '✓' : ''}</span><span>{item.label}</span>
              {item.shortcut && <span className="menu-shortcut">{item.shortcut}</span>}
            </button>)}
      </div>}
    </div>)}
  </div>;
}

export function WindowControls({ onClose }: { onClose: () => void }) {
  return <div className="window-controls">
    <span className="control-line" aria-hidden="true">−</span>
    <span className="control-square" aria-hidden="true">□</span>
    <button title="Close reader" aria-label="Close reader" onClick={onClose}><X size={14} /></button>
  </div>;
}

export function PageSelect({ count, page, onPage, label = 'Page' }: {
  count: number; page: number; onPage: (i: number) => void; label?: string;
}) {
  return <label className="page-select">{label}
    <select value={page} onChange={e => onPage(Number(e.target.value))}>
      {Array.from({ length: count }, (_, i) => <option key={i} value={i}>{i + 1} / {count}</option>)}
    </select>
    <ChevronDown size={12} aria-hidden="true" />
  </label>;
}
