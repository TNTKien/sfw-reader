export type TextView = 'excel' | 'code' | 'terminal';
export type ComicView = 'photoshop' | 'powerpoint' | 'canva';
export type View = TextView | ComicView;

interface DocumentBase {
  id: string;
  name: string;
  dispose: () => void;
}

export interface TextDocument extends DocumentBase {
  kind: 'text';
  chapters: { title: string }[];
  getText: (index: number) => Promise<string>;
}

export interface ComicDocument extends DocumentBase {
  kind: 'comic';
  pageCount: number;
  getImage: (index: number) => Promise<string>;
}

export type ReaderDocument = TextDocument | ComicDocument;

export interface PendingPdf {
  kind: 'pending-pdf';
  name: string;
  asText: () => TextDocument;
  asComic: () => ComicDocument;
  dispose: () => void;
}

export type LoadResult = ReaderDocument | PendingPdf;
