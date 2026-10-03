import { useEffect, useRef } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, FileImage, FileText, Keyboard, LockKeyhole, Monitor, ScanText, X } from 'lucide-react';

const shortcuts: {keys: string[]; action: string; context?: string}[] = [
  {keys: ['F1'], action: 'Open this guide', context: 'Anywhere in SFW Reader'},
  {keys: ['?'], action: 'Open this guide', context: 'When not typing'},
  {keys: ['Esc'], action: 'Close this guide', context: 'While it is open'},
  {keys: ['H'], action: 'Hide or show the SFW Reader header', context: 'While reading'},
  {keys: ['←', '→'], action: 'Previous / next page or chapter', context: 'Outside inputs and menus'},
  {keys: ['Page Up', 'Page Down'], action: 'Previous / next page or chapter', context: 'While reading'},
  {keys: ['Ctrl', 'O'], action: 'Open another local file', context: 'While reading (Cmd + O on Mac)'},
];

export default function HelpDialog({ onClose }: {onClose: () => void}) {
  const panel = useRef<HTMLElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButton.current?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
      if (event.key === 'Tab' && panel.current) {
        const focusable = Array.from(panel.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ));
        if (!focusable.length) return;
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault(); last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault(); first.focus();
        }
      }
    };
    window.addEventListener('keydown', keydown, true);
    return () => {
      window.removeEventListener('keydown', keydown, true);
      previous?.focus();
    };
  }, [onClose]);

  return <div className="dialog-backdrop help-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section ref={panel} className="help-dialog" role="dialog" aria-modal="true" aria-labelledby="help-heading">
      <div className="help-dialog-heading">
        <div className="help-dialog-brand"><span><BookOpen size={18}/></span><small>YOUR READING DESK</small></div>
        <button ref={closeButton} type="button" className="help-close" onClick={onClose} aria-label="Close guide" title="Close guide (Esc)"><X size={18}/></button>
      </div>
      <div className="help-dialog-scroll">
        <div className="help-columns">
          <section className="help-section">
            <h3 id="help-heading"><BookOpen size={17}/> Getting started</h3>
            <div className="help-step"><b>01</b><div><strong>Open a book</strong><p>Drop a file onto the home page or use <em>Choose a file</em>. You can also try either built-in demo.</p></div></div>
            <div className="help-step"><b>02</b><div><strong>Choose your workspace</strong><p>Text books open in Excel, VS Code, or Terminal. Comics open in Photoshop, PowerPoint, or Canva. Change the workspace from the reader header.</p></div></div>
            <div className="help-step"><b>03</b><div><strong>Read your way</strong><p>Use chapter/page controls or keyboard navigation. Text readers support sentences or paragraphs; comics support zoom.</p></div></div>
            <div className="help-format-note"><div><FileText size={17}/><strong>Text</strong><span>TXT · EPUB · text-based PDF</span></div>
              <div><FileImage size={17}/><strong>Comics</strong><span>Images · CBZ · ZIP · PDF</span></div></div>
          </section>
          <section className="help-section">
            <h3><Keyboard size={18}/> Keyboard shortcuts</h3>
            <div className="help-shortcuts">{shortcuts.map(item => <div className="help-shortcut" key={item.action+item.keys[0]}>
              <div className="help-shortcut-description"><strong>{item.action}</strong>{item.context && <small>{item.context}</small>}</div>
              <span className="help-key-set">{item.keys.map((key, i) => <kbd key={key+i}>{key}</kbd>)}</span>
            </div>)}</div>
            <p className="help-shortcut-tip"><ChevronLeft size={13}/><ChevronRight size={13}/> Navigation keys won't interrupt typing in inputs or the terminal prompt. Some browser shortcuts may take priority.</p>
          </section>
        </div>
        <div className="help-notes">
          <div><ScanText size={19}/><p><strong>Scanned PDFs</strong><br/>No OCR is performed. If selectable text isn't detected, open the file in a comic workspace to read its pages as images.</p></div>
          <div><Monitor size={19}/><p><strong>Terminal profiles</strong><br/>Switch between Warp, Ghostty, and Windows Terminal using the profile selector. Try <code>help</code>, <code>cat</code>, <code>next</code>, or <code>prev</code> in its prompt.</p></div>
          <div><LockKeyhole size={19}/><p><strong>Local reading</strong><br/>Files you choose stay on your device. Suicaodex chapter links load published pages from Suicaodex servers. Reading position and selected workspace may be saved in your browser.</p></div>
        </div>
      </div>
      <div className="help-dialog-footer"><span>F1 / ? to reopen this guide</span><button type="button" onClick={onClose}>Got it <span>↗</span></button></div>
    </section>
  </div>;
}
