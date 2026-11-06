import React from 'react';
import { splitTextWithHighlights } from '../utils/examEngine';

interface HighlightedTextProps {
  text: string;
  keywords: string[];
  highlightEnabled: boolean;
  className?: string;
  onWordClick?: (word: string, contextText: string) => void;
}

export const HighlightedText: React.FC<HighlightedTextProps> = ({
  text,
  keywords,
  highlightEnabled,
  className = '',
  onWordClick,
}) => {
  const renderInteractiveWords = (chunk: string, isHighlighted: boolean) => {
    if (!onWordClick) {
      return chunk;
    }
    const tokens = chunk.split(/(\s+)/);
    return tokens.map((token, idx) => {
      if (/^\s+$/.test(token) || token.length < 2) {
        return <React.Fragment key={idx}>{token}</React.Fragment>;
      }
      return (
        <span
          key={idx}
          onClick={(e) => {
            e.stopPropagation();
            onWordClick(token, text);
          }}
          title="اضغط لترجمة الكلمة وسماع نطقها (قاموس النقر الذكي)"
          className={`cursor-pointer rounded-xs transition-colors ${
            isHighlighted
              ? 'hover:bg-amber-500 hover:text-slate-950'
              : 'hover:bg-indigo-500/30 hover:text-amber-200 hover:underline decoration-dotted'
          }`}
        >
          {token}
        </span>
      );
    });
  };

  if (!highlightEnabled || !keywords || keywords.length === 0) {
    return <span className={className}>{renderInteractiveWords(text, false)}</span>;
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
            {renderInteractiveWords(seg.text, true)}
          </mark>
        ) : (
          <React.Fragment key={idx}>{renderInteractiveWords(seg.text, false)}</React.Fragment>
        )
      )}
    </span>
  );
};
