import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, X } from 'lucide-react';
import type { ReaderDocument, View } from '../types';

export interface WorkspaceChoice {
  id: View;
  title: string;
  desc: string;
}

function mark(view: View) {
  if (view === 'excel') return 'X';
  if (view === 'code') return '</>';
  if (view === 'terminal') return '>_';
  if (view === 'photoshop') return 'Ps';
  if (view === 'powerpoint') return 'P';
  return 'C';
}

export default function WorkspacePicker({ document, choices, initial, onOpen, onCancel }: {
  document: ReaderDocument;
  choices: WorkspaceChoice[];
  initial: View;
  onOpen: (view: View) => void;
  onCancel: () => void;
}) {
  const [selected, setSelected] = useState<View>(initial);
  const openButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setSelected(initial);
    openButton.current?.focus();
  }, [document.id, initial]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onCancel();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onCancel]);

  const current = choices.find(choice => choice.id === selected) ?? choices[0];
  return <div className="dialog-backdrop workspace-picker-backdrop">
    <section className="workspace-picker" role="dialog" aria-modal="true" aria-labelledby="workspace-picker-title">
      <button type="button" className="workspace-picker-close" onClick={onCancel} aria-label="Cancel opening this book"><X size={17}/></button>
      <span className="workspace-picker-kicker">CHOOSE YOUR COVER STORY</span>
      <h2 id="workspace-picker-title">Open this {document.kind === 'comic' ? 'comic' : 'book'} in…</h2>
      <p className="workspace-picker-book" title={document.name}>{document.name}</p>
      <div className="workspace-picker-grid" role="group" aria-label="Reading workspace">
        {choices.map(choice => <button type="button" key={choice.id}
          className={selected === choice.id ? 'workspace-choice selected' : 'workspace-choice'}
          aria-pressed={selected === choice.id}
          onClick={() => setSelected(choice.id)}
          onDoubleClick={() => onOpen(choice.id)}>
          <span className={'workspace-choice-mark workspace-choice-' + choice.id}>{mark(choice.id)}</span>
          <span className="workspace-choice-copy"><strong>{choice.title}</strong><small>{choice.desc}</small></span>
          <span className="workspace-choice-check">{selected === choice.id && <Check size={14}/>}</span>
        </button>)}
      </div>
      <p className="workspace-picker-note">You can switch to another compatible workspace at any time from the reader header.</p>
      <div className="workspace-picker-actions">
        <button type="button" className="workspace-picker-cancel" onClick={onCancel}>Cancel</button>
        <button ref={openButton} type="button" className="workspace-picker-open" onClick={() => onOpen(current.id)}>
          Open in {current.title} <ArrowRight size={16}/>
        </button>
      </div>
    </section>
  </div>;
}
