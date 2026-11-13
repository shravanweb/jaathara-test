import React, { useMemo } from 'react';
import raw from '../assets/Kolam/svg_terracotta/09_lotus.svg?raw';

// Inline kolam that "draws" itself like a muggu being drawn, then fades and repeats.
export default function KolamDraw({ className = '' }) {
  const html = useMemo(() => {
    let s = raw.replace(/<\?xml[^>]*>/, '').replace(/<title>[\s\S]*?<\/title>/, '');
    let i = 0;
    s = s.replace(/<(path|circle|polygon|polyline|line|ellipse|rect)\b([^>]*?)(\/?)>/g, (m, tag, attrs, close) => {
      const stroked = /stroke="(?!none)/.test(attrs) && /fill="none"/.test(attrs);
      const cls = stroked ? 'kd-line' : 'kd-dot';
      const idx = i++;
      return `<${tag}${attrs} pathLength="1" class="${cls}" style="--i:${idx}"${close}>`;
    });
    return s.replace('<svg', '<svg aria-hidden="true" focusable="false"');
  }, []);
  return <div className={`kolam-draw ${className}`} aria-hidden="true" dangerouslySetInnerHTML={{ __html: html }} />;
}