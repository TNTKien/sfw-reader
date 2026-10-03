import { useMemo } from 'react';
import ExcelApp from './ExcelApp';
import CodeApp from './CodeApp';
import TerminalApps from './TerminalApps';
import { splitText } from '../lib/text';
import type { TextView } from '../types';
import type { TerminalProfile } from '../lib/browserAppearance';

export interface TextProps {
  name: string;
  raw: string;
  loading: boolean;
  index: number;
  titles: { title: string }[];
  onPage: (n: number) => void;
  mode: 'sentence' | 'paragraph';
  onMode: (v: 'sentence' | 'paragraph') => void;
  view: TextView;
  setView: (v: TextView) => void;
  onTerminalProfileChange?: (profile: TerminalProfile) => void;
  openFile: () => void;
  close: () => void;
}


export default function TextApps(props: TextProps) {
  const rows = useMemo(() => splitText(props.raw, props.mode), [props.raw, props.mode]);
  if (props.view === 'terminal') return <TerminalApps props={props} rows={rows}/>;
  if (props.view === 'excel') return <ExcelApp props={props} rows={rows}/>;
  return <CodeApp props={props} rows={rows}/>;
}
