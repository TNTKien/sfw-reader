# SFW Reader

A playful, privacy-first reader that disguises your own text books and comics in familiar-looking desktop workspaces. **This is a visual simulation, not a functional office or image editor.** Not affiliated with Adobe, Microsoft, Canva, Warp, Ghostty or VS Code.

## What works

- **Text:** TXT, EPUB (chapters parsed from the EPUB spine), and text-based PDF (page-by-page extraction). Choose Excel, VS Code, or Terminal; switch between sentences and paragraphs.
- **Terminal:** Switch live between Warp-inspired blocks, minimal Ghostty and Windows Terminal/PowerShell skins. The choice is remembered locally; chapter/page navigation, line grouping and a small allowlisted set of *simulated* reader commands are available. This is not a real shell.
- **Comics:** CBZ/ZIP archives, multiple image files, and PDF. Switch between Photoshop-, PowerPoint- and Canva-inspired workspaces. The Photoshop UI includes working mock menus, tabs, navigator, tools, optional panels, page navigation and zoom.
- **Scanned PDFs:** SFW Reader does *not* offer OCR. If the initial pages don't contain enough extractable text, it suggests opening the PDF as a comic, with the option to try text mode anyway. Mixed documents or scans appearing later may require reopening the PDF as a comic; the detection is only a heuristic.
- **Local-first:** Files are read directly in the browser. Only extracted PDF text is cached (IndexedDB); reading position and selected workspace are stored in localStorage. No account, upload API or external OCR.
- **Lazy loading:** PDF pages and comic archive images are decoded as requested, with limited prefetching and memory-aware image cache eviction. Long text views virtualize visible rows.
- **Demo:** Built-in original sample text and simple original vector comic to try without choosing a file.

## Workspace

Desktop-focused chrome refinements are split into `src/workspace-fidelity-v2.css`, loaded after the earlier styles to keep the existing reading engine untouched.

- **Excel:** the green workbook header is retained; the Zoom slider now updates the actual sheet's text sizing and virtualization estimates.
- **VS Code:** Open Editors includes a direct link to the pinned story tab; Explorer is still generated from Git-tracked project files.
- **Photoshop:** contextual toolbars, gray workspace and dense side-panel proportions.
- **PowerPoint:** fuller ribbon, orange header, 16:9 canvas and lazily decoded thumbnails **only when their slide entries approach view**.
- **Canva:** tighter purple/blue title bar, more realistic panel, page and toolbar treatments.
- **Terminals:** separate styling for Warp blocks, minimal Ghostty and Windows Terminal tabs/prompt, preserving all three profile choices.

These layouts remain lightweight lookalike readers rather than full-fledged editors or real shells.

## Stack

Vite, React 19, TypeScript, PDF.js, JSZip, TanStack Virtual, lucide-react. No server-side runtime required.

## Run locally

```bash
bun install
bun run dev
bun run build
```

## Keyboard shortcuts

The guide is also accessible from the home page using **F1** or **?**. While a book is open:

- **F1 / ?** — Open the guide. Use Esc to close it.

- **H** — Hide or show the SFW Reader header. The hide button also shows this shortcut; a subtle tab at the top restores the header with a click.
- **Left / Right arrows** — Previous / next comic page in Photoshop, PowerPoint and Canva workspaces (also available after clicking toolbar or workspace buttons).
- **Page Up / Page Down** — Navigate pages or chapters as before.
- **Terminal:** Use on-screen Previous/Next chapter or enter `next`/`prev` in the simulated prompt (arrows within the prompt move the text cursor normally).
- **Ctrl/Cmd + O** — Open another local file, even while the reader header is hidden.

Navigation and ? shortcuts leave text fields, dropdowns, editable content and mock application menus alone. F1 opens the guide even from a focused input (subject to browser shortcut overrides). Use unmodified keys for navigation.

## Notes and limits

- Recommended maximum input size is 350 MB per file; large PDFs, long EPUBs and image archives still depend on device RAM, CPU and browser storage quotas.
- The EPUB parser supports standard EPUB spine/HTML chapter content but does not reproduce original CSS, images or complex multi-column book layouts. Some DRM-protected or unusual EPUBs may not load.
- The PDF extraction is deliberately lightweight. Complex layouts, columns and image-only pages may not preserve reading order. This project intentionally does not OCR scans.
- Archive reading sorts images naturally by their filenames. Files are decoded on demand; only recognized image formats are displayed. Do not use untrusted archives beyond your device's capabilities.
- Terminal prompt commands are limited to `help`, `ls`, `pwd`, `cat`/`less`, `clear`, `next`, `prev`, `theme warp|ghostty|windows`, `mode sentence|paragraph`, and `view excel|code`. Commands never execute on the device.
- Workspace chrome imitates familiar visual patterns for fun. Buttons explicitly labeled as simulation or disabled do not edit documents, and reading operations are limited to page selection, zoom, view switching and file opening.
- The main layouts target desktop screens; smaller screens hide some simulated panels.

## Privacy

Files do not leave your device. The site doesn't implement upload endpoints. Google Fonts is used on the landing page and may load stylesheet/font assets from Google's CDN; remove the `@import` line in `src/styles.css` if you prefer a fully offline third-party-free UI. For privacy-sensitive use, consider bundling your own licensed fonts instead.
