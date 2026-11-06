import React, { useState } from 'react';
import { Volume2, Square } from 'lucide-react';
import { playGermanAudio, stopGermanAudio } from '../utils/b2StudyEngine';

interface AudioListenButtonProps {
  text: string;
  label?: string;
  compact?: boolean;
}

export const AudioListenButton: React.FC<AudioListenButtonProps> = ({
  text,
  label = 'استمع',
  compact = false,
}) => {
  const [playingRate, setPlayingRate] = useState<number | null>(null);

  const handlePlay = (rate: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (playingRate === rate) {
      stopGermanAudio();
      setPlayingRate(null);
      return;
    }
    setPlayingRate(rate);
    void playGermanAudio(text, rate, () => {
      setPlayingRate(null);
    });
  };

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    stopGermanAudio();
    setPlayingRate(null);
  };

  return (
    <div
      className="inline-flex items-center gap-1 bg-slate-950/90 border border-indigo-500/30 rounded-xl p-0.5 shadow-xs"
      dir="ltr"
    >
      <button
        type="button"
        onClick={(e) => handlePlay(1.0, e)}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
          playingRate === 1.0
            ? 'bg-emerald-500 text-slate-950 font-black'
            : 'text-indigo-200 hover:bg-slate-800 hover:text-white'
        }`}
        title="الاستماع للنص بالسرعة العادية (1.0x)"
      >
        <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
        {!compact && <span dir="rtl">{label}</span>}
        <span className="font-mono">🔊 1x</span>
      </button>

      <button
        type="button"
        onClick={(e) => handlePlay(0.8, e)}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
          playingRate === 0.8
            ? 'bg-amber-400 text-slate-950 font-black'
            : 'text-amber-300/90 hover:bg-slate-800'
        }`}
        title="الاستماع للنص ببطء لتسهيل الفهم (0.8x)"
      >
        <span>🐢 0.8x</span>
      </button>

      <button
        type="button"
        onClick={handleStop}
        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold text-rose-300 hover:bg-rose-500/20 hover:text-rose-200 transition-all cursor-pointer"
        title="إيقاف الصوت فوراً"
      >
        <Square className="w-3 h-3 fill-current" />
        <span dir="rtl">{compact ? '⏹️' : '⏹️ إيقاف الصوت'}</span>
      </button>
    </div>
  );
};
