import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  RegionalStandard,
  ScriptType,
  PhoneticDisplayMode,
  FontFamilyOption,
  ToolType,
  BackgroundGridType,
  DrawingStroke,
  TextBlockItem,
  CharacterPhonetic,
  DictionaryData,
} from './types';
import { textToPhonetics } from './utils/phonetics';
import { Navbar } from './components/Navbar';
import { Toolbar } from './components/Toolbar';
import { CanvasBoard } from './components/CanvasBoard';
import { PronunciationModal } from './components/PronunciationModal';
import { StrokeOrderModal } from './components/StrokeOrderModal';
import { DictionaryModal } from './components/DictionaryModal';
import { ExportModal } from './components/ExportModal';
import { TextInputDialog } from './components/TextInputDialog';

interface HistoryState {
  strokes: DrawingStroke[];
  textBlocks: TextBlockItem[];
}

export function App() {
  // Global Teaching Settings
  const [standard, setStandard] = useState<RegionalStandard>('taiwan');
  const [script, setScript] = useState<ScriptType>('traditional');
  const [displayMode, setDisplayMode] = useState<PhoneticDisplayMode>('both');
  const [fontFamily, setFontFamily] = useState<FontFamilyOption>('kaishu');
  const [fontSize, setFontSize] = useState<number>(54);

  // Drawing and Canvas Tools
  const [currentTool, setCurrentTool] = useState<ToolType>('select');
  const [currentColor, setCurrentColor] = useState<string>('#1e293b');
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [gridType, setGridType] = useState<BackgroundGridType>('tianzige');
  const [highlightRadical, setHighlightRadical] = useState<boolean>(false);
  const [radicalColor, setRadicalColor] = useState<string>('#dc2626');

  // Whiteboard Objects
  const [strokes, setStrokes] = useState<DrawingStroke[]>([]);
  const [textBlocks, setTextBlocks] = useState<TextBlockItem[]>(() => {
    // Initial sample lesson for the teacher
    const initialText = '歡迎學習華語';
    const parsed = textToPhonetics(initialText, 'taiwan', 'traditional');
    return [
      {
        id: 'block_seed_1',
        type: 'text',
        x: 60,
        y: 60,
        rawText: initialText,
        fontSize: 54,
        letterSpacing: 16,
        fontFamily: 'kaishu',
        textColor: '#1e293b',
        showTianzige: true,
        highlightRadical: false,
        radicalColor: '#dc2626',
        characters: parsed,
      },
    ];
  });

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>('block_seed_1');

  // Undo / Redo History
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Modals state
  const [pronunciationModalData, setPronunciationModalData] = useState<{
    charData: CharacterPhonetic;
    blockId: string;
    charIndex: number;
  } | null>(null);

  const [strokeOrderChar, setStrokeOrderChar] = useState<string | null>(null);
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);
  const [dictionaryQuery, setDictionaryQuery] = useState('華語');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isTextInputOpen, setIsTextInputOpen] = useState(false);
  const [pendingTextPos, setPendingTextPos] = useState<{ x: number; y: number } | null>(null);

  const boardRef = useRef<HTMLDivElement | null>(null);

  // Push history snapshot
  const pushHistory = useCallback(
    (newStrokes: DrawingStroke[], newBlocks: TextBlockItem[]) => {
      setHistory((prev) => {
        const next = prev.slice(0, historyIndex + 1);
        return [...next, { strokes: newStrokes, textBlocks: newBlocks }];
      });
      setHistoryIndex((prev) => prev + 1);
    },
    [historyIndex]
  );

  // Handle undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setStrokes(prev.strokes);
      setTextBlocks(prev.textBlocks);
      setHistoryIndex(historyIndex - 1);
    } else if (historyIndex === 0) {
      setStrokes([]);
      setTextBlocks([]);
      setHistoryIndex(-1);
    }
  }, [history, historyIndex]);

  // Handle redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setStrokes(next.strokes);
      setTextBlocks(next.textBlocks);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex]);

  // Add a new stroke
  const handleAddStroke = (newStroke: DrawingStroke) => {
    const updated = [...strokes, newStroke];
    setStrokes(updated);
    pushHistory(updated, textBlocks);
  };

  // Add or update text block
  const handleUpdateBlock = (updatedBlock: TextBlockItem) => {
    setTextBlocks((prev) => {
      const next = prev.map((b) => {
        if (b.id !== updatedBlock.id) return b;
        // If rawText changed, re-parse characters
        if (b.rawText !== updatedBlock.rawText) {
          const chars = textToPhonetics(updatedBlock.rawText, standard, script);
          return {
            ...updatedBlock,
            characters: chars,
          };
        }
        return updatedBlock;
      });
      pushHistory(strokes, next);
      return next;
    });
  };

  // Delete text block
  const handleDeleteBlock = (id: string) => {
    const updated = textBlocks.filter((b) => b.id !== id);
    setTextBlocks(updated);
    setSelectedBlockId(null);
    pushHistory(strokes, updated);
  };

  // Clear whiteboard
  const handleClearBoard = () => {
    if (window.confirm('確定要清空白板上的所有手寫繪圖與文字塊嗎？')) {
      setStrokes([]);
      setTextBlocks([]);
      setSelectedBlockId(null);
      pushHistory([], []);
    }
  };

  // When standard (taiwan/mainland) or script (traditional/simplified) changes,
  // re-parse phonetics across text blocks while keeping manual overrides
  useEffect(() => {
    setTextBlocks((prev) =>
      prev.map((b) => {
        const recomputed = textToPhonetics(b.rawText, standard, script);
        // Preserve manual overrides
        const merged = recomputed.map((ch, idx) => {
          const oldCh = b.characters[idx];
          if (oldCh && oldCh.customOverridden) {
            return {
              ...ch,
              pinyin: oldCh.pinyin,
              zhuyin: oldCh.zhuyin,
              zhuyinTone: oldCh.zhuyinTone,
              pinyinTone: oldCh.pinyinTone,
              customOverridden: true,
            };
          }
          return ch;
        });
        return {
          ...b,
          characters: merged,
        };
      })
    );
  }, [standard, script]);

  // Open pronunciation correction modal
  const handleOpenPronunciation = (
    charData: CharacterPhonetic,
    blockId: string,
    charIndex: number
  ) => {
    setPronunciationModalData({ charData, blockId, charIndex });
  };

  // Save corrected pronunciation
  const handleSavePronunciation = (updated: CharacterPhonetic) => {
    if (!pronunciationModalData) return;
    const { blockId, charIndex } = pronunciationModalData;

    setTextBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId) return b;
        const newChars = [...b.characters];
        newChars[charIndex] = updated;
        return {
          ...b,
          characters: newChars,
        };
      })
    );
    setPronunciationModalData(null);
  };

  // Create new text block from dialog
  const handleConfirmTextInput = (
    text: string,
    fSize: number,
    fFamily: FontFamilyOption,
    showTianzige: boolean,
    isHighlightRadical: boolean
  ) => {
    setFontFamily(fFamily);
    setFontSize(fSize);
    const chars = textToPhonetics(text, standard, script);
    const xPos = pendingTextPos ? pendingTextPos.x : 100;
    const yPos = pendingTextPos ? pendingTextPos.y : 150 + textBlocks.length * 60;

    const newBlock: TextBlockItem = {
      id: `block_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'text',
      x: Math.max(20, Math.min(window.innerWidth - 300, xPos)),
      y: Math.max(40, Math.min(window.innerHeight - 200, yPos)),
      rawText: text,
      fontSize: fSize,
      letterSpacing: 12,
      fontFamily: fFamily,
      textColor: currentColor === '#ffffff' ? '#1e293b' : currentColor,
      showTianzige,
      highlightRadical: isHighlightRadical,
      radicalColor,
      characters: chars,
    };

    const nextBlocks = [...textBlocks, newBlock];
    setTextBlocks(nextBlocks);
    setSelectedBlockId(newBlock.id);
    setPendingTextPos(null);
    pushHistory(strokes, nextBlocks);
  };

  // Insert rich dictionary card onto the whiteboard
  const handleInsertDictionaryCard = (dict: DictionaryData) => {
    const wordText = script === 'simplified' ? dict.simplified : dict.traditional;
    const chars = textToPhonetics(wordText, standard, script);

    // If TOCFL or HSK level exists, append explanation block
    const cardBlock: TextBlockItem = {
      id: `block_dict_${Date.now()}`,
      type: 'text',
      x: 80,
      y: 120 + textBlocks.length * 70,
      rawText: wordText,
      fontSize: 58,
      letterSpacing: 14,
      fontFamily: fontFamily,
      textColor: '#1e293b',
      showTianzige: true,
      highlightRadical: false,
      radicalColor: '#dc2626',
      characters: chars,
    };

    const nextBlocks = [...textBlocks, cardBlock];
    setTextBlocks(nextBlocks);
    setSelectedBlockId(cardBlock.id);
    pushHistory(strokes, nextBlocks);
  };

  // Active selected text block
  const activeBlock = textBlocks.find((b) => b.id === selectedBlockId);
  const effectiveFontFamily = activeBlock ? activeBlock.fontFamily : fontFamily;
  const effectiveFontSize = activeBlock ? activeBlock.fontSize : fontSize;

  // Change font family: immediately updates the selected text block (or all blocks on board),
  // and updates the default fontFamily for newly added text blocks
  const handleSelectFontFamily = (newFont: FontFamilyOption) => {
    setFontFamily(newFont);
    if (selectedBlockId && activeBlock) {
      setTextBlocks((prev) => {
        const next = prev.map((b) => (b.id === selectedBlockId ? { ...b, fontFamily: newFont } : b));
        pushHistory(strokes, next);
        return next;
      });
    } else if (textBlocks.length > 0) {
      // If no specific block is selected, update all blocks on whiteboard
      setTextBlocks((prev) => {
        const next = prev.map((b) => ({ ...b, fontFamily: newFont }));
        pushHistory(strokes, next);
        return next;
      });
    }
  };

  // Change font size: immediately updates the selected text block (or all blocks on board)
  const handleChangeFontSize = (newSize: number) => {
    setFontSize(newSize);
    if (selectedBlockId && activeBlock) {
      setTextBlocks((prev) => {
        const next = prev.map((b) => (b.id === selectedBlockId ? { ...b, fontSize: newSize } : b));
        pushHistory(strokes, next);
        return next;
      });
    } else if (textBlocks.length > 0) {
      setTextBlocks((prev) => {
        const next = prev.map((b) => ({ ...b, fontSize: newSize }));
        pushHistory(strokes, next);
        return next;
      });
    }
  };

  // Keyboard shortcuts (Ctrl+Z, Ctrl+Y, tool keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid if user is currently typing in an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'v':
          setCurrentTool('select');
          break;
        case 'm':
          setCurrentTool('hand');
          break;
        case 'p':
          setCurrentTool('pen');
          break;
        case 'h':
          setCurrentTool('highlighter');
          break;
        case 'l':
          setCurrentTool('laser');
          break;
        case 't':
          setCurrentTool('text');
          setIsTextInputOpen(true);
          break;
        case 'e':
          setCurrentTool('eraser');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-stone-100 text-stone-900 font-sans">
      {/* Top Navbar */}
      <Navbar
        standard={standard}
        onSelectStandard={setStandard}
        script={script}
        onSelectScript={setScript}
        displayMode={displayMode}
        onSelectDisplayMode={setDisplayMode}
        fontFamily={effectiveFontFamily}
        onSelectFontFamily={handleSelectFontFamily}
        fontSize={effectiveFontSize}
        onChangeFontSize={handleChangeFontSize}
        onOpenDictionary={() => setIsDictionaryOpen(true)}
        onOpenStrokeOrder={() => setStrokeOrderChar('中')}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {/* Main Interactive Whiteboard Stage */}
      <main className="flex-1 relative overflow-hidden">
        <CanvasBoard
          tool={currentTool}
          color={currentColor}
          strokeWidth={strokeWidth}
          gridType={gridType}
          strokes={strokes}
          onAddStroke={handleAddStroke}
          textBlocks={textBlocks}
          selectedBlockId={selectedBlockId}
          onSelectBlock={setSelectedBlockId}
          onUpdateBlock={handleUpdateBlock}
          onDeleteBlock={handleDeleteBlock}
          globalDisplayMode={displayMode}
          onOpenPronunciation={handleOpenPronunciation}
          onOpenStrokeOrder={(c) => setStrokeOrderChar(c)}
          boardRef={boardRef}
          onQuickAddTextAt={(x, y) => {
            setPendingTextPos({ x, y });
            setIsTextInputOpen(true);
          }}
        />

        {/* Bottom Floating Toolbar */}
        <Toolbar
          currentTool={currentTool}
          onSelectTool={setCurrentTool}
          currentColor={currentColor}
          onSelectColor={setCurrentColor}
          strokeWidth={strokeWidth}
          onSelectStrokeWidth={setStrokeWidth}
          gridType={gridType}
          onSelectGridType={setGridType}
          radicalColor={radicalColor}
          onSelectRadicalColor={setRadicalColor}
          highlightRadical={highlightRadical}
          onToggleHighlightRadical={() => setHighlightRadical(!highlightRadical)}
          canUndo={historyIndex >= 0}
          canRedo={historyIndex < history.length - 1}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onClearBoard={handleClearBoard}
          onOpenDictionary={() => setIsDictionaryOpen(true)}
          onOpenStrokeOrderModal={() => setStrokeOrderChar('中')}
          onOpenExportModal={() => setIsExportOpen(true)}
          onAddTextPrompt={() => {
            setPendingTextPos(null);
            setIsTextInputOpen(true);
          }}
        />
      </main>

      {/* Pronunciation & Tone Correction Modal */}
      {pronunciationModalData && (
        <PronunciationModal
          charData={pronunciationModalData.charData}
          standard={standard}
          onSave={handleSavePronunciation}
          onClose={() => setPronunciationModalData(null)}
        />
      )}

      {/* Stroke Order Animation Modal */}
      {strokeOrderChar && (
        <StrokeOrderModal
          initialChar={strokeOrderChar}
          onClose={() => setStrokeOrderChar(null)}
        />
      )}

      {/* Dictionary, MOE Standards & Level Benchmarks Modal */}
      {isDictionaryOpen && (
        <DictionaryModal
          initialQuery={dictionaryQuery}
          standard={standard}
          script={script}
          onInsertToWhiteboard={handleInsertDictionaryCard}
          onClose={() => setIsDictionaryOpen(false)}
        />
      )}

      {/* Export to PDF / PNG Modal */}
      {isExportOpen && (
        <ExportModal
          textBlocks={textBlocks}
          displayMode={displayMode}
          boardElementRef={boardRef}
          onClose={() => setIsExportOpen(false)}
        />
      )}

      {/* Text Input Dialog */}
      {isTextInputOpen && (
        <TextInputDialog
          standard={standard}
          script={script}
          fontFamily={fontFamily}
          defaultFontSize={fontSize}
          highlightRadical={highlightRadical}
          radicalColor={radicalColor}
          onConfirm={handleConfirmTextInput}
          onClose={() => {
            setIsTextInputOpen(false);
            setPendingTextPos(null);
          }}
        />
      )}
    </div>
  );
}

export default App;
