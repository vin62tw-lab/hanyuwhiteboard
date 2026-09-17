import React, { useState, useRef } from 'react';
import {
  GripHorizontal,
  Trash2,
  Edit2,
  Sparkles,
  Type,
  Maximize2,
  Grid,
  Check
} from 'lucide-react';
import { TextBlockItem, CharacterPhonetic, FontFamilyOption, PhoneticDisplayMode } from '../types';
import { getFontFamilyStyle } from '../utils/fonts';

interface TextBlockViewProps {
  block: TextBlockItem;
  isSelected: boolean;
  globalDisplayMode: PhoneticDisplayMode;
  onSelect: () => void;
  onUpdate: (updated: TextBlockItem) => void;
  onDelete: () => void;
  onOpenPronunciation: (charData: CharacterPhonetic, blockId: string, charIndex: number) => void;
  onOpenStrokeOrder: (char: string) => void;
  onDragStart: (e: React.MouseEvent | React.PointerEvent, blockId: string) => void;
  isDragging?: boolean;
}

export const TextBlockView: React.FC<TextBlockViewProps> = ({
  block,
  isSelected,
  globalDisplayMode,
  onSelect,
  onUpdate,
  onDelete,
  onOpenPronunciation,
  onOpenStrokeOrder,
  onDragStart,
  isDragging = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(block.rawText);
  const charPointerStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTextSubmit = () => {
    if (editText.trim() !== block.rawText) {
      // Reparse phonetics in App.tsx or parent
      onUpdate({
        ...block,
        rawText: editText,
      });
    }
    setIsEditing(false);
  };

  // Determine effective display mode (block specific or global override)
  const displayMode = block.displayMode || globalDisplayMode;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onPointerDown={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest('button, select, input, textarea, .char-interactive-span')) {
          return;
        }
        e.stopPropagation();
        onSelect();
        onDragStart(e, block.id);
      }}
      style={{
        position: 'absolute',
        left: `${block.x}px`,
        top: `${block.y}px`,
      }}
      className={`group select-none rounded-2xl transition-shadow ${
        isDragging
          ? 'ring-2 ring-indigo-500 shadow-2xl scale-[1.01] bg-white/95 z-50 cursor-grabbing'
          : isSelected
          ? 'ring-2 ring-indigo-500/80 shadow-xl bg-white/90 backdrop-blur-xs z-30 cursor-grab'
          : 'hover:ring-1 hover:ring-indigo-300/80 hover:shadow-md bg-white/60 hover:bg-white/80 z-20 cursor-grab'
      }`}
    >
      {/* Top Drag Handle Header - Always visible for effortless moving */}
      <div
        onPointerDown={(e) => {
          e.stopPropagation();
          onSelect();
          onDragStart(e, block.id);
        }}
        title="按住此處拖曳文字框到白板任意位置"
        className="w-full flex items-center justify-between px-2.5 py-1 bg-stone-100/90 hover:bg-indigo-50/90 border-b border-stone-200/80 rounded-t-2xl cursor-grab active:cursor-grabbing touch-none select-none transition-colors"
      >
        <div className="flex items-center gap-1.5 text-[11px] text-stone-600 font-semibold">
          <GripHorizontal className="w-3.5 h-3.5 text-stone-400 group-hover:text-indigo-600 transition-colors" />
          <span className="text-[10px] sm:text-[11px]">按住拖曳位置</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-stone-400 font-mono">
          <span>{block.fontSize}px</span>
        </div>
      </div>
      {/* Top Floating Control Bar when Selected */}
      {isSelected && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          className="absolute -top-12 left-0 flex items-center gap-1.5 px-3 py-1.5 bg-stone-900/90 text-white rounded-xl shadow-xl text-xs z-30 backdrop-blur-sm animate-fade-in whitespace-nowrap"
        >
          {/* Drag Handle */}
          <div
            onMouseDown={(e) => onDragStart(e, block.id)}
            onPointerDown={(e) => onDragStart(e, block.id)}
            title="按住拖曳位置"
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-white/20 rounded-md text-stone-300 touch-none"
          >
            <GripHorizontal className="w-4 h-4" />
          </div>

          {/* Quick Edit Text */}
          <button
            onClick={() => setIsEditing(true)}
            title="編輯文字"
            className="p-1 hover:bg-white/20 rounded-md text-stone-200"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-3.5 bg-white/20 my-auto" />

          {/* Font Selector */}
          <div className="flex items-center gap-1 px-1">
            <Type className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <select
              value={block.fontFamily}
              onChange={(e) => onUpdate({ ...block, fontFamily: e.target.value as FontFamilyOption })}
              title="切換此文字塊字體"
              className="bg-stone-800 text-stone-100 text-[11px] rounded-md px-1.5 py-0.5 border border-stone-700 outline-hidden font-medium cursor-pointer hover:bg-stone-700 focus:ring-1 focus:ring-indigo-400"
            >
              <option value="kaishu">標楷體</option>
              <option value="songti">宋體</option>
              <option value="heiti">黑體</option>
              <option value="fangsong">仿宋體</option>
              <option value="calligraphy">毛筆體</option>
            </select>
          </div>

          <div className="w-px h-3.5 bg-white/20 my-auto" />

          {/* Font Size Stepper */}
          <div className="flex items-center gap-1 px-1">
            <span className="text-[10px] text-stone-400">字號:</span>
            <button
              onClick={() => onUpdate({ ...block, fontSize: Math.max(24, block.fontSize - 6) })}
              className="w-5 h-5 flex items-center justify-center hover:bg-white/20 rounded-md text-xs font-bold"
            >
              -
            </button>
            <span className="font-mono text-[11px] font-semibold">{block.fontSize}</span>
            <button
              onClick={() => onUpdate({ ...block, fontSize: Math.min(140, block.fontSize + 6) })}
              className="w-5 h-5 flex items-center justify-center hover:bg-white/20 rounded-md text-xs font-bold"
            >
              +
            </button>
          </div>

          <div className="w-px h-3.5 bg-white/20 my-auto" />

          {/* Letter Spacing Stepper */}
          <div className="flex items-center gap-1 px-1">
            <span className="text-[10px] text-stone-400">字距:</span>
            <button
              onClick={() => onUpdate({ ...block, letterSpacing: Math.max(0, block.letterSpacing - 4) })}
              className="w-5 h-5 flex items-center justify-center hover:bg-white/20 rounded-md text-xs font-bold"
            >
              -
            </button>
            <span className="font-mono text-[11px] font-semibold">{block.letterSpacing}</span>
            <button
              onClick={() => onUpdate({ ...block, letterSpacing: Math.min(60, block.letterSpacing + 4) })}
              className="w-5 h-5 flex items-center justify-center hover:bg-white/20 rounded-md text-xs font-bold"
            >
              +
            </button>
          </div>

          <div className="w-px h-3.5 bg-white/20 my-auto" />

          {/* Tianzige Toggle */}
          <button
            onClick={() => onUpdate({ ...block, showTianzige: !block.showTianzige })}
            title="切換田字格底框"
            className={`px-2 py-0.5 rounded-md flex items-center gap-1 text-[11px] font-medium transition-colors ${
              block.showTianzige ? 'bg-red-600 text-white font-bold' : 'hover:bg-white/20 text-stone-300'
            }`}
          >
            <Grid className="w-3 h-3" />
            田字格
          </button>

          <div className="w-px h-3.5 bg-white/20 my-auto" />

          {/* Delete Button */}
          <button
            onClick={onDelete}
            title="刪除此文字塊"
            className="p-1 hover:bg-red-500/80 rounded-md text-red-400 hover:text-white transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Editing Input Mode */}
      {isEditing ? (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          className="p-3 bg-white border-2 border-indigo-500 rounded-xl shadow-xl min-w-[280px]"
        >
          <div className="text-xs font-semibold text-stone-500 mb-1.5">即時編輯打字內容：</div>
          <input
            type="text"
            autoFocus
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTextSubmit();
              if (e.key === 'Escape') setIsEditing(false);
            }}
            className="w-full px-3 py-2 text-lg border border-stone-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden font-serif"
          />
          <div className="flex justify-end gap-2 mt-2.5">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 text-xs text-stone-500 hover:bg-stone-100 rounded-md"
            >
              取消
            </button>
            <button
              onClick={handleTextSubmit}
              className="px-3 py-1 text-xs bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700"
            >
              更新標音
            </button>
          </div>
        </div>
      ) : (
        /* Render Characters with Authentic Taiwanese Zhuyin & Pinyin */
        <div
          className="flex flex-wrap items-end p-2.5"
          style={{ gap: `${block.letterSpacing}px` }}
        >
          {block.characters.map((ch, idx) => {
            const isChinese = Boolean(ch.zhuyin || ch.pinyin);
            const showZhuyin = isChinese && (displayMode === 'zhuyin' || displayMode === 'both') && ch.zhuyin;
            const showPinyin = isChinese && (displayMode === 'pinyin' || displayMode === 'both') && ch.pinyin;

            return (
              <div
                key={idx}
                className={`relative flex flex-col items-center group/char transition-transform ${
                  block.showTianzige
                    ? 'p-1.5 border border-red-300/80 bg-red-50/20 rounded-lg shadow-xs'
                    : ''
                }`}
                title="點擊以修改此字發音或聲調"
              >
                {/* Tianzige inner dashed crosslines */}
                {block.showTianzige && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-full border-t border-dashed border-red-200/90" />
                    <div className="h-full border-l border-dashed border-red-200/90 absolute" />
                  </div>
                )}

                {/* 1. Top Pinyin */}
                {showPinyin && (
                  <div
                    style={{
                      fontSize: `${Math.max(12, Math.round(block.fontSize * 0.34))}px`,
                    }}
                    className="font-mono text-sky-800 font-semibold tracking-normal leading-none mb-1 select-none pointer-events-none"
                  >
                    {ch.pinyin}
                  </div>
                )}

                {/* 2. Character & Right-side Vertical Zhuyin Layout */}
                <div className="flex items-center">
                  {/* Chinese Character with Drag or Pronunciation Click Detection */}
                  <span
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      onSelect();
                      charPointerStartRef.current = { x: e.clientX, y: e.clientY };
                      let hasMoved = false;

                      const handleMove = (moveEv: PointerEvent) => {
                        if (!charPointerStartRef.current) return;
                        const dist = Math.hypot(
                          moveEv.clientX - charPointerStartRef.current.x,
                          moveEv.clientY - charPointerStartRef.current.y
                        );
                        if (dist > 5) {
                          hasMoved = true;
                          window.removeEventListener('pointermove', handleMove);
                          window.removeEventListener('pointerup', handleUp);
                          onDragStart(e, block.id);
                        }
                      };

                      const handleUp = () => {
                        window.removeEventListener('pointermove', handleMove);
                        window.removeEventListener('pointerup', handleUp);
                        if (!hasMoved) {
                          onOpenPronunciation(ch, block.id, idx);
                        }
                        charPointerStartRef.current = null;
                      };

                      window.addEventListener('pointermove', handleMove);
                      window.addEventListener('pointerup', handleUp, { once: true });
                    }}
                    style={{
                      fontSize: `${block.fontSize}px`,
                      fontFamily: getFontFamilyStyle(block.fontFamily),
                      color: block.textColor || '#1e293b',
                      lineHeight: 1.15,
                    }}
                    className="char-interactive-span cursor-grab active:cursor-grabbing hover:opacity-85 transition-opacity relative z-10 font-medium select-none"
                  >
                    {ch.char}
                  </span>

                  {/* Right-side Vertical Taiwanese Zhuyin (注音) Layout */}
                  {showZhuyin && (() => {
                    const rawZhuyin = ch.zhuyin || '';
                    let effectiveTone = ch.zhuyinTone || '';
                    if (!effectiveTone) {
                      if (rawZhuyin.includes('˙')) effectiveTone = '˙';
                      else if (rawZhuyin.includes('ˊ')) effectiveTone = 'ˊ';
                      else if (rawZhuyin.includes('ˇ')) effectiveTone = 'ˇ';
                      else if (rawZhuyin.includes('ˋ')) effectiveTone = 'ˋ';
                    }
                    const isNeutralTone = effectiveTone === '˙' || rawZhuyin.includes('˙');
                    const cleanZhuyin = rawZhuyin.replace(/[˙ˊˇˋ]/g, '');
                    const zhuyinLetters = Array.from(cleanZhuyin);
                    const zhuyinFontSize = Math.max(11, Math.round(block.fontSize * 0.28));
                    const toneFontSize = Math.max(10, Math.round(zhuyinFontSize * 0.95));

                    return (
                      <div
                        style={{
                          fontSize: `${zhuyinFontSize}px`,
                          minHeight: `${block.fontSize}px`,
                          fontFamily: '"DFKai-SB", "BiauKai", "KaiTi", "Noto Sans TC", "Microsoft JhengHei", sans-serif',
                        }}
                        className="flex flex-col justify-center items-center pl-1 text-stone-800 leading-none select-none shrink-0"
                      >
                        {/* 輕聲 (五聲)：依標準規範置於聲母（第一個注音符號）的正上方 */}
                        {isNeutralTone && (
                          <div
                            className="flex items-center justify-center select-none"
                            style={{
                              height: `${Math.max(6, Math.round(zhuyinFontSize * 0.5))}px`,
                              marginBottom: `${Math.max(1, Math.round(zhuyinFontSize * 0.1))}px`,
                            }}
                            title="輕聲"
                          >
                            <span
                              className="rounded-full bg-amber-800 shrink-0"
                              style={{
                                width: `${Math.max(4, Math.round(zhuyinFontSize * 0.32))}px`,
                                height: `${Math.max(4, Math.round(zhuyinFontSize * 0.32))}px`,
                              }}
                            />
                          </div>
                        )}

                        {/* 注音符號直排與側邊聲調符號 */}
                        <div className="flex items-center justify-center">
                          <div className="flex flex-col items-center justify-around font-bold leading-tight">
                            {zhuyinLetters.map((b, bIdx) => {
                              const isLast = bIdx === zhuyinLetters.length - 1;
                              const hasSideTone = isLast && !isNeutralTone && Boolean(effectiveTone);

                              return (
                                <div
                                  key={bIdx}
                                  className="relative flex items-center justify-center leading-none"
                                >
                                  <span className="leading-none text-center">
                                    {b}
                                  </span>

                                  {/* 二聲、三聲、四聲：置於最後一個注音符號（韻母）右邊偏上位置 */}
                                  {hasSideTone && (
                                    <span
                                      className="absolute left-full top-0 ml-0.5 font-bold text-amber-800 select-none pointer-events-none"
                                      style={{
                                        fontSize: `${toneFontSize}px`,
                                        lineHeight: 1,
                                        transform: 'translateY(-20%)',
                                        fontFamily: '"DFKai-SB", "BiauKai", "KaiTi", "Noto Sans TC", "Microsoft JhengHei", system-ui, sans-serif',
                                      }}
                                      title={`${effectiveTone} 聲調`}
                                    >
                                      {effectiveTone}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* 留出側邊聲調寬度，避免與下一個中文字重疊 */}
                          {!isNeutralTone && effectiveTone && (
                            <span
                              className="inline-block pointer-events-none"
                              style={{ width: `${Math.max(6, Math.round(toneFontSize * 0.6))}px` }}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Quick Stroke Order Button on Hover */}
                {isChinese && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenStrokeOrder(ch.char);
                    }}
                    title={`查看「${ch.char}」標準筆順動畫`}
                    className="absolute -bottom-5 opacity-0 group-hover/char:opacity-100 transition-opacity p-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-medium flex items-center gap-0.5 shadow-xs z-20 whitespace-nowrap"
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    筆順
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
