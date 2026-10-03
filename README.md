# SFW Reader

A playful, privacy-first reader that disguises your own text books and comics in familiar-looking desktop workspaces. **This is a visual simulation, not a functional office or image editor.** Not affiliated with Adobe, Microsoft, Canva or VS Code.

## What works

- **Text:** TXT, EPUB (chapters parsed from the EPUB spine), and text-based PDF (page-by-page extraction). Choose an Excel-inspired sheet or a VS Code-inspired editor; switch between sentences and paragraphs.
- **Comics:** CBZ/ZIP archives, multiple image files, and PDF. Switch between Photoshop-, PowerPoint- and Canva-inspired workspaces. The Photoshop UI includes working mock menus, tabs, navigator, tools, optional panels, page navigation and zoom.
- **Scanned PDFs:** SFW Reader does *not* offer OCR. If the initial pages don't contain enough extractable text, it suggests opening the PDF as a comic, with the option to try text mode anyway. Mixed documents or scans appearing later may require reopening the PDF as a comic; the detection is only a heuristic.
- **Local-first:** Files are read directly in the browser. Only extracted PDF text is cached (IndexedDB); reading position and selected workspace are stored in localStorage. No account, upload API or external OCR.
- **Lazy loading:** PDF pages and comic archive images are decoded as requested, with limited prefetching and memory-aware image cache eviction. Long text views virtualize visible rows.
- **Demo:** Built-in original sample text and simple original vector comic to try without choosing a file.

## Stack

Vite, React 19, TypeScript, PDF.js, JSZip, TanStack Virtual, lucide-react. No server-side runtime required.

## Run locally

```bash
npm install
npm run dev
npm run build
```

## Deploy to Vercel

Import `TNTKien/sfw-reader` into Vercel, choose **Vite** (or use the included `vercel.json`), and deploy. `npm run build` creates `dist/`; no environment variables are needed. All user book processing runs in the browser.

## Notes and limits

- Recommended maximum input size is 350 MB per file; large PDFs, long EPUBs and image archives still depend on device RAM, CPU and browser storage quotas.
- The EPUB parser supports standard EPUB spine/HTML chapter content but does not reproduce original CSS, images or complex multi-column book layouts. Some DRM-protected or unusual EPUBs may not load.
- The PDF extraction is deliberately lightweight. Complex layouts, columns and image-only pages may not preserve reading order. This project intentionally does not OCR scans.
- Archive reading sorts images naturally by their filenames. Files are decoded on demand; only recognized image formats are displayed. Do not use untrusted archives beyond your device's capabilities.
- Workspace chrome imitates familiar visual patterns for fun. Buttons explicitly labeled as simulation or disabled do not edit documents, and reading operations are limited to page selection, zoom, view switching and file opening.
- The main layouts target desktop screens; smaller screens hide some simulated panels.

## Privacy

Files do not leave your device. The site doesn't implement upload endpoints. Google Fonts is used on the landing page and may load stylesheet/font assets from Google's CDN; remove the `@import` line in `src/styles.css` if you prefer a fully offline third-party-free UI. For privacy-sensitive use, consider bundling your own licensed fonts instead.
