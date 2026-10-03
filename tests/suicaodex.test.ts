import { describe, expect, test } from 'bun:test';
import { loadSuicaodexChapter, parseSuicaodexChapter, routeChapterId } from '../src/lib/suicaodex';

const id = 'c9c45a08-96b3-49e0-b59c-71c1200c3b89';

describe('Suicaodex chapter links', () => {
  test('accepts a raw chapter UUID', () => {
    expect(parseSuicaodexChapter(id.toUpperCase())).toBe(id);
  });
  test('accepts the public reader URL and nested manga paths', () => {
    expect(parseSuicaodexChapter('https://suicaodex.com/chapter/' + id)).toBe(id);
    expect(parseSuicaodexChapter('https://suicaodex.com/manga/manga-id/series/chapter/' + id + '?ref=reader')).toBe(id);
    expect(parseSuicaodexChapter('https://redive.suicaodex.com/v1/chapters/' + id)).toBe(id);
  });
  test('accepts a shared SFW Reader chapter route', () => {
    expect(parseSuicaodexChapter('https://sfw.suicaodex.com/read-scd/' + id)).toBe(id);
    expect(routeChapterId('/read-scd/' + id + '/')).toBe(id);
  });
  test('rejects unrelated domains and malformed identifiers', () => {
    expect(parseSuicaodexChapter('https://suicaodex.com.evil.example/chapter/' + id)).toBeNull();
    expect(parseSuicaodexChapter('javascript:alert(1)')).toBeNull();
    expect(parseSuicaodexChapter('/chapter/' + id)).toBeNull();
    expect(parseSuicaodexChapter('https://suicaodex.com/chapter/not-a-uuid')).toBeNull();
    expect(routeChapterId('/other/' + id)).toBeNull();
  });
});

describe('direct browser chapter requests', () => {
  test('fetches from the public API without a same-origin proxy', async () => {
    const originalFetch = globalThis.fetch;
    let requestedUrl: string | undefined;
    globalThis.fetch = async (input, init) => {
      requestedUrl = String(input);
      expect(init?.method).toBe('GET');
      return new Response(JSON.stringify({
        id, number: '1', volume: null, title: 'Example', manga: { title: 'Sample', id },
        pages: [{position: 0, url: 'https://cdn.example.com/image.webp', optimizedUrl: null, replicaUrl: null}],
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    };
    try {
      const chapter = await loadSuicaodexChapter(id);
      expect(requestedUrl).toBe('https://redive.suicaodex.com/v1/chapters/' + id);
      expect(chapter.pageCount).toBe(1);
      expect(chapter.name).toBe('Sample — Chapter 1: Example');
      chapter.dispose();
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test('explains a failed direct network/CORS request', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => { throw new TypeError('Failed to fetch'); };
    try {
      await expect(loadSuicaodexChapter(id)).rejects.toThrow(/CORS/);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
