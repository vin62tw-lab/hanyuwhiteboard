import React, { useState } from 'react';
import { X, Type, Check, Sparkles, Grid, Palette } from 'lucide-react';
import {
  RegionalStandard,
  ScriptType,
  FontFamilyOption,
  PhoneticDisplayMode,
} from '../types';
import { textToPhonetics } from '../utils/phonetics';
import { getFontFamilyStyle } from '../utils/fonts';

interface TextInputDialogProps {
  standard: RegionalStandard;
  script: ScriptType;
  fontFamily: FontFamilyOption;
  defaultFontSize: number;
  highlightRadical?: boolean;
  radicalColor?: string;
  onConfirm: (
    text: string,
    fontSize: number,
    fontFamily: FontFamilyOption,
    showTianzige: boolean,
    highlightRadical?: boolean
  ) => void;
  onClose: () => void;
}

export const TextInputDialog: React.FC<TextInputDialogProps> = ({
  standard,
  script,
  fontFamily,
  defaultFontSize,
  onConfirm,
  onClose,
}) => {
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(defaultFontSize);
  const [selectedFont, setSelectedFont] = useState<FontFamilyOption>(fontFamily);
  const [showTianzige, setShowTianzige] = useState(false);

  // Quick preset sentences Chinese teachers often use
  const PRESET_SENTENCES = [
    '歡迎來到華語課！',
    '今天我們要學新生字。',
    '你好，很高興認識你。',
    '請大家跟我一起念。',
    '學習華語真有趣！',
  ];

  const previewItems = text.trim() ? textToPhonetics(text, standard, script) : [];

  const handleConfirm = () => {
    if (!text.trim()) return;
    onConfirm(text.trim(), fontSize, selectedFont, showTianzige, false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
              <Type className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-stone-800 text-base">即時打字與自動標音</h3>
              <p className="text-xs text-stone-500">輸入中文將自動標示標準注音與漢語拼音</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Area */}
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-stone-600 block mb-1.5">
              請在此輸入課堂文字內容：
            </label>
            <textarea
              autoFocus
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="例如：你好！歡迎來到中文課。請跟我一起念。"
              className="w-full px-3.5 py-2.5 text-base border border-stone-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-serif"
            />
          </div>

          {/* Quick Presets */}
          <div>
            <div className="text-[11px] text-stone-500 mb-1">常用教學短句：</div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_SENTENCES.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setText(s)}
                  className="px-2 py-1 text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview */}
          {previewItems.length > 0 && (
            <div className="p-3.5 bg-amber-50/50 border border-amber-200/80 rounded-xl">
              <div className="text-xs font-semibold text-amber-900 mb-2 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                即時自動標音預覽：
              </div>
              <div className="flex flex-wrap items-end gap-2 max-h-28 overflow-y-auto">
                {previewItems.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <span className="text-[10px] font-mono text-sky-800 font-semibold">{item.pinyin}</span>
                    <div className="flex items-center">
                      <span
                        className="text-xl font-bold text-stone-900"
                        style={{ fontFamily: getFontFamilyStyle(selectedFont) }}
                      >
                        {item.char}
                      </span>
                      {item.zhuyin && (() => {
                        const rawZy = item.zhuyin || '';
                        let tone = item.zhuyinTone || '';
                        if (!tone) {
                          if (rawZy.includes('˙')) tone = '˙';
                          else if (rawZy.includes('ˊ')) tone = 'ˊ';
                          else if (rawZy.includes('ˇ')) tone = 'ˇ';
                          else if (rawZy.includes('ˋ')) tone = 'ˋ';
                        }
                        const isNeutral = tone === '˙' || rawZy.includes('˙');
                        const cleanZy = rawZy.replace(/[˙ˊˇˋ]/g, '');
                        const letters = Array.from(cleanZy);

                        return (
                          <div
                            style={{
                              fontFamily: '"DFKai-SB", "BiauKai", "KaiTi", "Noto Sans TC", "Microsoft JhengHei", sans-serif',
                            }}
                            className="text-stone-700 flex flex-col items-center justify-center pl-1 select-none leading-none"
                          >
                            {/* 輕聲圓點在聲母正上方 */}
                            {isNeutral && (
                              <div className="flex items-center justify-center mb-0.5" title="輕聲">
                                <span className="w-1 h-1 rounded-full bg-amber-800 shrink-0" />
                              </div>
                            )}

                            <div className="flex items-center">
                              <div className="flex flex-col text-[10px] leading-tight font-bold">
                                {letters.map((z, zIdx) => {
                                  const isLast = zIdx === letters.length - 1;
                                  const showSideTone = isLast && !isNeutral && Boolean(tone);
                                  return (
                                    <div key={zIdx} className="relative flex items-center justify-center">
                                      <span>{z}</span>
                                      {showSideTone && (
                                        <span
                                          className="absolute left-full top-0 ml-0.5 text-amber-800 text-[10px] font-bold select-none"
                                          style={{ transform: 'translateY(-20%)' }}
                                        >
                                          {tone}
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                              {!isNeutral && tone && <span className="inline-block w-2" />}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Typography & Layout Controls */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-xs font-semibold text-stone-600 block mb-1">字級大小：</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={28}
                  max={96}
                  step={4}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <span className="font-mono text-xs font-bold text-stone-700 w-8">{fontSize}px</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-600 block mb-1">字體選擇：</label>
              <select
                value={selectedFont}
                onChange={(e) => setSelectedFont(e.target.value as FontFamilyOption)}
                className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg bg-white"
              >
                <option value="kaishu">標準標楷體 (KaiTi)</option>
                <option value="songti">宋體 (SongTi)</option>
                <option value="heiti">黑體 (Noto Sans)</option>
                <option value="fangsong">仿宋體 (FangSong)</option>
                <option value="calligraphy">書法毛筆體 (Brush)</option>
              </select>
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center gap-3 pt-1">
            <label className="flex items-center gap-1.5 text-xs text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showTianzige}
                onChange={(e) => setShowTianzige(e.target.checked)}
                className="rounded text-red-600 focus:ring-red-500"
              />
              <Grid className="w-3.5 h-3.5 text-red-600" />
              <span>顯示田字格方框</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-stone-50 border-t border-stone-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs text-stone-600 hover:bg-stone-200 rounded-lg transition-colors font-medium"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={!text.trim()}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg transition-colors font-semibold shadow-xs"
          >
            <Check className="w-4 h-4" />
            放上白板
          </button>
        </div>
      </div>
    </div>
  );
};
