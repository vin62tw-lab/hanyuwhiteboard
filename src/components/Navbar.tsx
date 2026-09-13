import React from 'react';
import {
  Languages,
  BookMarked,
  Search,
  Sparkles,
  Download,
  Sliders,
  Type,
  Maximize,
  Volume2
} from 'lucide-react';
import {
  RegionalStandard,
  ScriptType,
  PhoneticDisplayMode,
  FontFamilyOption,
} from '../types';

interface NavbarProps {
  standard: RegionalStandard;
  onSelectStandard: (std: RegionalStandard) => void;
  script: ScriptType;
  onSelectScript: (s: ScriptType) => void;
  displayMode: PhoneticDisplayMode;
  onSelectDisplayMode: (mode: PhoneticDisplayMode) => void;
  fontFamily: FontFamilyOption;
  onSelectFontFamily: (font: FontFamilyOption) => void;
  fontSize: number;
  onChangeFontSize: (size: number) => void;
  onOpenDictionary: () => void;
  onOpenStrokeOrder: () => void;
  onOpenExport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  standard,
  onSelectStandard,
  script,
  onSelectScript,
  displayMode,
  onSelectDisplayMode,
  fontFamily,
  onSelectFontFamily,
  fontSize,
  onChangeFontSize,
  onOpenDictionary,
  onOpenStrokeOrder,
  onOpenExport,
}) => {
  return (
    <header className="min-h-14 py-1.5 md:py-0 bg-white/95 backdrop-blur-md border-b border-stone-200 px-3 md:px-4 flex items-center justify-between z-30 select-none shrink-0 shadow-xs gap-2">
      {/* Brand & Title */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-red-700 text-white flex items-center justify-center font-serif font-black text-lg shadow-sm border border-red-800 shrink-0">
          華
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <h1 className="font-bold text-stone-900 text-sm md:text-base tracking-wide font-serif whitespace-nowrap">
              華語白板
            </h1>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-800 font-semibold border border-red-200 hidden md:inline">
              課堂專用
            </span>
          </div>
        </div>
      </div>

      {/* Center Settings: Standard, Script, Phonetics, Fonts */}
      <div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto py-1 scrollbar-thin max-w-full">
        {/* Taiwan vs Mainland Standard */}
        <div className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200 shrink-0">
          <button
            onClick={() => onSelectStandard('taiwan')}
            className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              standard === 'taiwan'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            國語
          </button>
          <button
            onClick={() => onSelectStandard('mainland')}
            className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              standard === 'mainland'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            普通話
          </button>
        </div>

        {/* Traditional vs Simplified */}
        <div className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200 shrink-0">
          <button
            onClick={() => onSelectScript('traditional')}
            className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              script === 'traditional'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            繁體
          </button>
          <button
            onClick={() => onSelectScript('simplified')}
            className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              script === 'simplified'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            簡體
          </button>
        </div>

        {/* Phonetic Display Mode */}
        <div className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200 shrink-0">
          {[
            { id: 'both' as PhoneticDisplayMode, label: '注音+拼音' },
            { id: 'zhuyin' as PhoneticDisplayMode, label: '注音' },
            { id: 'pinyin' as PhoneticDisplayMode, label: '拼音' },
            { id: 'none' as PhoneticDisplayMode, label: '隱藏' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => onSelectDisplayMode(m.id)}
              className={`px-1.5 sm:px-2 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                displayMode === m.id
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Font Family Selector */}
        <div className="flex items-center gap-1.5 bg-stone-100 border border-stone-200 rounded-xl px-2.5 py-1 shrink-0 hover:bg-stone-50 transition-colors">
          <Type className="w-3.5 h-3.5 text-stone-500 shrink-0" />
          <select
            id="navbar-font-select"
            value={fontFamily}
            onChange={(e) => onSelectFontFamily(e.target.value as FontFamilyOption)}
            title="更換白板字體（標楷體 / 宋體 / 黑體 / 仿宋體 / 毛筆體）"
            className="bg-transparent text-stone-800 text-xs font-medium focus:ring-0 outline-hidden cursor-pointer"
          >
            <option value="kaishu">標楷體</option>
            <option value="songti">宋體</option>
            <option value="heiti">黑體</option>
            <option value="fangsong">仿宋體</option>
            <option value="calligraphy">毛筆體</option>
          </select>
        </div>

        {/* Font Size Presets */}
        <div className="hidden xl:flex items-center gap-1 bg-stone-100 px-2 py-1 rounded-xl border border-stone-200 shrink-0">
          <span className="text-[11px] text-stone-500 font-medium">字級:</span>
          {[36, 48, 64, 80].map((s) => (
            <button
              key={s}
              onClick={() => onChangeFontSize(s)}
              className={`px-1.5 py-0.5 text-xs rounded-md font-mono ${
                fontSize === s ? 'bg-white font-bold text-indigo-700 shadow-2xs' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Right Quick Shortcuts */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <button
          onClick={onOpenStrokeOrder}
          className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-800 rounded-xl text-xs font-semibold transition-colors border border-red-200/80 shrink-0"
          title="中文字筆順動畫"
        >
          <Sparkles className="w-3.5 h-3.5 text-red-600" />
          <span className="hidden sm:inline">筆順</span>
        </button>

        <button
          onClick={onOpenDictionary}
          className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold transition-colors border border-emerald-200/80 shrink-0"
          title="辭典與等級查詢"
        >
          <Search className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline">辭典</span>
        </button>

        <button
          onClick={onOpenExport}
          className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-semibold transition-colors shadow-xs shrink-0"
          title="匯出教材"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">匯出</span>
        </button>
      </div>
    </header>
  );
};
