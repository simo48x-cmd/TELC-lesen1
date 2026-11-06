import React from 'react';
import { splitTextWithHighlights } from '../utils/examEngine';

interface HighlightedTextProps {
  text: string;
  keywords: string[];
  highlightEnabled: boolean;
  className?: string;
}

export const HighlightedText: React.FC<HighlightedTextProps> = ({
  text,
  keywords,
  highlightEnabled,
  className = '',
}) => {
  if (!highlightEnabled || !keywords || keywords.length === 0) {
    return <span className={className}>{text}</span>;
  }

  const segments = splitTextWithHighlights(text, keywords);
  return (
    <span className={className}>
      {segments.map((seg, idx) =>
        seg.highlighted ? (
          <mark
            key={idx}
            className="bg-yellow-300 text-slate-950 font-extrabold px-1 py-0.5 rounded-sm shadow-xs underline decoration-amber-600/60 decoration-2"
          >
            {seg.text}
          </mark>
        ) : (
          <React.Fragment key={idx}>{seg.text}</React.Fragment>
        )
      )}
    </span>
  );
};
