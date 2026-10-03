import { describe, expect, test } from 'bun:test';
import { parseSuicaodexChapter, routeChapterId } from '../src/lib/suicaodex';

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
