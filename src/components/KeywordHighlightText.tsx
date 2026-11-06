import React from 'react';
import { splitTextByKeywords } from '../utils/examEngine';

interface KeywordHighlightTextProps {
  text: string;
  keywords: string[];
  enabled: boolean;
  className?: string;
}

export const KeywordHighlightText: React.FC<KeywordHighlightTextProps> = ({
  text,
  keywords,
  enabled,
  className = '',
}) => {
  if (!enabled || keywords.length === 0) {
    return <span className={className}>{text}</span>;
  }

  const segments = splitTextByKeywords(text, keywords);

  return (
    <span className={className}>
      {segments.map((seg, i) =>
        seg.highlighted ? (
          <mark
            key={i}
            className="bg-yellow-200 dark:bg-yellow-500/40 text-slate-950 dark:text-yellow-100 font-bold px-1 rounded"
          >
            {seg.text}
          </mark>
        ) : (
          <React.Fragment key={i}>{seg.text}</React.Fragment>
        )
      )}
    </span>
  );
};
