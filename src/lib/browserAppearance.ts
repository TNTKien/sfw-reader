import type { View } from '../types';

export type TerminalProfile = 'warp' | 'ghostty' | 'windows';

export function getStoredTerminalProfile(): TerminalProfile {
  try {
    const saved = localStorage.getItem('sfw-terminal-skin');
    if (saved === 'warp' || saved === 'ghostty' || saved === 'windows') return saved;
  } catch { /* Browser storage is optional. */ }
  return 'ghostty';
}

type Appearance = { label: string; background: string; foreground: string; icon: string; theme: string };

// Original, small SVG marks inspired by each type of workspace. No remote icon assets.
const appearances: Record<View | 'home' | TerminalProfile, Appearance> = {
  home: {
    label: 'SFW Reader', background: '#c9f194', foreground: '#243c2b', theme: '#101419',
    icon: '<path d="M8 11.5c5-2 8-1.3 12 .7v20c-4-2.1-7-2.6-12-.7zm12 .7c4-2 7-2.7 12-.7v20c-5-1.9-8-1.4-12 .7M20 12v20" fill="none" stroke="#243c2b" stroke-width="2.5" stroke-linejoin="round"/>',
  },
  excel: {
    label: 'Excel', background: '#107c41', foreground: '#fff', theme: '#196b43',
    icon: '<rect x="17" y="9" width="18" height="22" rx="1.5" fill="#e8fff2" opacity=".95"/><path d="M17 16h18M17 23h18M26 9v22" stroke="#16854f" stroke-width="1.5"/><path d="M6 13l18-3v22L6 29z" fill="#08552f"/><text x="14" y="26" font-family="Arial,sans-serif" font-size="15" text-anchor="middle" font-weight="800" fill="#fff">X</text>',
  },
  code: {
    label: 'Visual Studio Code', background: '#172f4d', foreground: '#24a4f2', theme: '#20212b',
    icon: '<path d="M28 6L14 17l-7-5-3 3 10 5L4 25l3 3 7-5 14 11 7-4V10z" fill="none" stroke="#39b7fc" stroke-width="3" stroke-linejoin="round"/><path d="M28 8v24" stroke="#39b7fc" stroke-width="2"/>',
  },
  terminal: {
    label: 'Terminal', background: '#242638', foreground: '#ade9bb', theme: '#171923',
    icon: '<rect x="5" y="8" width="30" height="24" rx="4" fill="#19212c" stroke="#a5bbce" stroke-width="2"/><path d="M11 16l6 5-6 5M21 26h8" stroke="#9feab6" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
  },
  photoshop: {
    label: 'Adobe Photoshop', background: '#001e36', foreground: '#49c6ff', theme: '#262626',
    icon: '<rect x="2" y="2" width="36" height="36" rx="6" fill="#001e36" stroke="#195879" stroke-width="1"/><text x="20" y="27" text-anchor="middle" font-family="Arial,sans-serif" font-size="19" font-weight="700" fill="#39bbf9">Ps</text>',
  },
  powerpoint: {
    label: 'PowerPoint', background: '#c34b28', foreground: '#fff', theme: '#b8492b',
    icon: '<circle cx="23" cy="20" r="13" fill="#f18b63"/><path d="M23 7a13 13 0 0 1 0 26z" fill="#e3653f"/><path d="M5 10l18-3v26L5 30z" fill="#a7351a"/><text x="13.5" y="26" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" font-weight="800" fill="#fff">P</text>',
  },
  canva: {
    label: 'Canva', background: '#6353c9', foreground: '#fff', theme: '#5756cc',
    icon: '<defs><linearGradient id="c" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#20c8cc"/><stop offset="1" stop-color="#8058de"/></linearGradient></defs><rect x="1" y="1" width="38" height="38" rx="11" fill="url(#c)"/><text x="20" y="29" font-family="Georgia,serif" font-size="29" font-style="italic" font-weight="700" text-anchor="middle" fill="white">C</text>',
  },
  warp: {
    label: 'Warp', background: '#2b203c', foreground: '#bca8f9', theme: '#221d2a',
    icon: '<rect x="4" y="4" width="32" height="32" rx="9" fill="#574073"/><path d="M10 13l8 7-8 7M21 27h9" stroke="#d7c7ff" stroke-width="3.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  },
  ghostty: {
    label: 'Ghostty', background: '#191a2a', foreground: '#b4befe', theme: '#232435',
    icon: '<path d="M10 31V16c0-7 5-10 10-10s10 3 10 10v15l-5-3-5 3-5-3z" fill="#d9daf1"/><circle cx="16" cy="18" r="2" fill="#262638"/><circle cx="24" cy="18" r="2" fill="#262638"/><path d="M18 24h4" stroke="#38394f" stroke-width="2" stroke-linecap="round"/>',
  },
  windows: {
    label: 'Windows Terminal', background: '#173a61', foreground: '#a3d7ff', theme: '#202b3b',
    icon: '<rect x="4" y="6" width="32" height="27" rx="4" fill="#123c66" stroke="#8cc7f5" stroke-width="2"/><rect x="4" y="6" width="32" height="6" rx="3" fill="#5a9bce"/><path d="M11 18l5 5-5 5M21 28h8" stroke="#d6eeff" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  },
};

function faviconSvg(config: Appearance): string {
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="8" fill="' +
    config.background + '"/>' + config.icon + '</svg>';
}

export function updateBrowserAppearance(
  view: View | 'home',
  filename?: string,
  terminalProfile: TerminalProfile = 'ghostty',
  pageIndex = 0,
): void {
  const active = view === 'terminal' ? terminalProfile : view;
  const config = appearances[active];
  const base = filename?.replace(/\.[^./\\]+$/, '').trim() || 'Untitled';

  document.title = view === 'home' ? 'SFW Reader — A different kind of reading desk'
    : view === 'excel' ? base + '.xlsx - Excel'
    : view === 'code' ? base + '.md - Visual Studio Code'
    : view === 'photoshop' ? String(pageIndex + 1).padStart(2,'0') + '.psd @ SFW Reader - Adobe Photoshop'
    : view === 'powerpoint' ? base + '.pptx - PowerPoint'
    : view === 'canva' ? base + ' - Canva'
    : view === 'terminal' && terminalProfile === 'warp' ? base + ' — Warp'
    : view === 'terminal' && terminalProfile === 'ghostty' ? 'reader@localhost: ~/books — Ghostty'
    : view === 'terminal' ? 'PowerShell — Windows Terminal'
    : 'SFW Reader';

  let icon = document.querySelector<HTMLLinkElement>('link[data-sfw-favicon]');
  if (!icon) {
    icon = document.createElement('link');
    icon.dataset.sfwFavicon = '';
    document.head.appendChild(icon);
  }
  icon.rel = 'icon';
  icon.type = 'image/svg+xml';
  icon.href = 'data:image/svg+xml,' + encodeURIComponent(faviconSvg(config));

  const theme = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (theme) theme.content = config.theme;
}
