export function normalizeText(input: string): string {
  return input
    .replace(/\r\n?/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function splitText(text: string, mode: 'sentence' | 'paragraph'): string[] {
  const paragraphs = normalizeText(text).split(/\n+/).map(p => p.trim()).filter(Boolean);
  if (mode === 'paragraph') return paragraphs;
  const segmenter = new Intl.Segmenter('vi', { granularity: 'sentence' });
  return paragraphs.flatMap(p => Array.from(segmenter.segment(p), s => s.segment.trim()).filter(Boolean));
}

export function naturalCompare(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}
