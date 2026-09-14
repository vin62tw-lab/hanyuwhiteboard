import React from 'react';
import {
  MousePointer,
  PenTool,
  Highlighter,
  Type,
  Eraser,
  Palette,
  RotateCcw,
  RotateCw,
  Trash2,
  Sparkles,
  Search,
  Download,
  Crosshair,
} from 'lucide-react';
import { ToolType, BackgroundGridType } from '../types';

interface ToolbarProps {
  currentTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  currentColor: string;
  onSelectColor: (color: string) => void;
  strokeWidth: number;
  onSelectStrokeWidth: (width: number) => void;
  gridType: BackgroundGridType;
  onSelectGridType: (type: BackgroundGridType) => void;
  radicalColor?: string;
  onSelectRadicalColor?: (color: string) => void;
  highlightRadical?: boolean;
  onToggleHighlightRadical?: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClearBoard: () => void;
  onOpenDictionary: () => void;
  onOpenStrokeOrderModal: () => void;
  onOpenExportModal: () => void;
  onAddTextPrompt: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  onSelectTool,
  currentColor,
  onSelectColor,
  strokeWidth,
  onSelectStrokeWidth,
  gridType,
  onSelectGridType,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClearBoard,
  onOpenDictionary,
  onOpenStrokeOrderModal,
  onOpenExportModal,
  onAddTextPrompt,
}) => {
  const COLOR_PALETTE = [
    { name: '墨黑', value: '#1e293b' },
    { name: '硃砂紅', value: '#dc2626' },
    { name: '湛藍', value: '#2563eb' },
    { name: '翠綠', value: '#16a34a' },
    { name: '琥珀金', value: '#d97706' },
    { name: '青蓮紫', value: '#7c3aed' },
  ];

  return (
    <aside className="fixed bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 sm:gap-1.5 p-1.5 sm:p-2 bg-stone-900/95 text-white rounded-2xl shadow-2xl backdrop-blur-md border border-stone-700/60 max-w-[96vw] overflow-x-auto select-none scrollbar-thin">
      {/* Primary Tool Buttons */}
      <div className="flex items-center gap-1 bg-stone-800/80 p-1 rounded-xl shrink-0">
        <button
          onClick={() => onSelectTool('select')}
          title="選取/移動物件 (V)"
          className={`p-2 rounded-lg transition-colors ${
            currentTool === 'select'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-stone-300 hover:text-white hover:bg-stone-700/60'
          }`}
        >
          <MousePointer className="w-4 h-4" />
        </button>

        <button
          onClick={() => onSelectTool('pen')}
          title="彩筆書寫劃線 (P)"
          className={`p-2 rounded-lg transition-colors ${
            currentTool === 'pen'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-stone-300 hover:text-white hover:bg-stone-700/60'
          }`}
        >
          <PenTool className="w-4 h-4" />
        </button>

        <button
          onClick={() => onSelectTool('highlighter')}
          title="螢光重點標記筆 (H)"
          className={`p-2 rounded-lg transition-colors ${
            currentTool === 'highlighter'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-stone-300 hover:text-white hover:bg-stone-700/60'
          }`}
        >
          <Highlighter className="w-4 h-4" />
        </button>

        <button
          onClick={() => onSelectTool('laser')}
          title="雷射筆/紅光教學指標 (L)"
          className={`p-2 rounded-lg transition-colors ${
            currentTool === 'laser'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-stone-300 hover:text-white hover:bg-stone-700/60'
          }`}
        >
          <Crosshair className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            onSelectTool('text');
            onAddTextPrompt();
          }}
          title="即時打字輸入/插入標音文字框 (T)"
          className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
            currentTool === 'text'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-stone-300 hover:text-white hover:bg-stone-700/60'
          }`}
        >
          <Type className="w-4 h-4" />
          <span className="text-xs font-semibold hidden sm:inline">打字</span>
        </button>

        <button
          onClick={() => onSelectTool('eraser')}
          title="橡皮擦 (E)"
          className={`p-2 rounded-lg transition-colors ${
            currentTool === 'eraser'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-stone-300 hover:text-white hover:bg-stone-700/60'
          }`}
        >
          <Eraser className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-6 bg-stone-700 mx-0.5" />

      {/* Colors */}
      <div className="flex items-center gap-1 shrink-0">
        {COLOR_PALETTE.map((c) => (
          <button
            key={c.value}
            onClick={() => onSelectColor(c.value)}
            title={c.name}
            className={`w-5 h-5 rounded-full transition-transform shrink-0 ${
              currentColor === c.value
                ? 'scale-125 ring-2 ring-white ring-offset-1 ring-offset-stone-900'
                : 'hover:scale-110 opacity-90'
            }`}
            style={{ backgroundColor: c.value }}
          />
        ))}
      </div>

      <div className="w-px h-6 bg-stone-700 mx-0.5 shrink-0" />

      {/* Stroke width */}
      <div className="hidden sm:flex items-center gap-1 bg-stone-800/80 px-1.5 py-1 rounded-xl shrink-0">
        {[2, 5, 10, 18].map((w) => (
          <button
            key={w}
            onClick={() => onSelectStrokeWidth(w)}
            title={`線條粗細: ${w}px`}
            className={`w-6 h-6 flex items-center justify-center rounded-lg ${
              strokeWidth === w ? 'bg-stone-700 text-white' : 'hover:bg-stone-800 text-stone-400'
            }`}
          >
            <div
              className="bg-current rounded-full"
              style={{ width: `${Math.min(14, w + 2)}px`, height: `${Math.min(14, w + 2)}px` }}
            />
          </button>
        ))}
      </div>

      <div className="hidden sm:block w-px h-6 bg-stone-700 mx-0.5 shrink-0" />

      {/* Grid Selection */}
      <div className="flex items-center gap-1 shrink-0">
        {[
          { type: 'tianzige' as BackgroundGridType, label: '田字格' },
          { type: 'mizige' as BackgroundGridType, label: '米字格' },
          { type: 'lines' as BackgroundGridType, label: '橫線' },
          { type: 'blank' as BackgroundGridType, label: '空白' },
        ].map((g) => (
          <button
            key={g.type}
            onClick={() => onSelectGridType(g.type)}
            className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
              gridType === g.type
                ? 'bg-stone-700 text-white font-bold'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-stone-700 mx-0.5 shrink-0" />

      {/* Undo / Redo / Clear */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="復原 (Ctrl+Z)"
          className="p-1.5 rounded-lg text-stone-400 hover:text-white disabled:opacity-30 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="重做 (Ctrl+Y)"
          className="p-1.5 rounded-lg text-stone-400 hover:text-white disabled:opacity-30 transition-colors"
        >
          <RotateCw className="w-4 h-4" />
        </button>
        <button
          onClick={onClearBoard}
          title="清空白板"
          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-900/40 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="hidden lg:block w-px h-6 bg-stone-700 mx-0.5 shrink-0" />

      {/* Feature Action Buttons */}
      <div className="hidden lg:flex items-center gap-1.5 shrink-0">
        <button
          onClick={onOpenStrokeOrderModal}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-red-700 hover:bg-red-600 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs whitespace-nowrap"
          title="示範中文字筆順動畫"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>筆順</span>
        </button>

        <button
          onClick={onOpenDictionary}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs whitespace-nowrap"
          title="查詢教育部國語辭典 / TOCFL / TBCL / HSK"
        >
          <Search className="w-3.5 h-3.5" />
          <span>辭典</span>
        </button>

        <button
          onClick={onOpenExportModal}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs whitespace-nowrap"
          title="匯出至 Word / Google Docs / PDF / PNG / GIF"
        >
          <Download className="w-3.5 h-3.5" />
          <span>匯出</span>
        </button>
      </div>
    </aside>
  );
};
