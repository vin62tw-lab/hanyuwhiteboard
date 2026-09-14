import React, { useState } from 'react';
import { X, Search, Volume2, PlusCircle, Book, Award, Layers, Sparkles, Loader2, BookmarkCheck } from 'lucide-react';
import { DictionaryData, RegionalStandard, ScriptType } from '../types';
import { getOfflineDictionaryData } from '../utils/dictionaryFallback';

interface DictionaryModalProps {
  initialQuery?: string;
  standard: RegionalStandard;
  script: ScriptType;
  onInsertToWhiteboard: (data: DictionaryData) => void;
  onClose: () => void;
}

export const DictionaryModal: React.FC<DictionaryModalProps> = ({
  initialQuery = '華語',
  standard,
  script,
  onInsertToWhiteboard,
  onClose,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DictionaryData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedVoiceLang, setSelectedVoiceLang] = useState<'zh-TW' | 'zh-CN'>(
    standard === 'taiwan' ? 'zh-TW' : 'zh-CN'
  );

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/dictionary/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, standard, script }),
      });

      if (res.ok) {
        const data: DictionaryData = await res.json();
        setResult(data);
        return;
      }
      // If server responded with error (e.g. 404 on static hosting or 429 quota), use offline data
      const fallback = getOfflineDictionaryData(q, standard, script);
      setResult(fallback);
    } catch (err: any) {
      console.warn('Backend dictionary lookup unavailable, using local dictionary generator:', err);
      // Seamlessly fallback to offline local dictionary
      const fallback = getOfflineDictionaryData(q, standard, script);
      setResult(fallback);
    } finally {
      setLoading(false);
    }
  };

  // Perform initial search when opened
  React.useEffect(() => {
    if (initialQuery) {
      handleSearch();
    }
  }, []);

  const handlePlayAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedVoiceLang;
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Book className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-800 text-lg">教育部辭典 & 華語文等級檢索</h3>
              <p className="text-xs text-stone-500">
                整合臺灣教育部辭典、TOCFL、TBCL 基準與中國 HSK 等級評定
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-5 border-b border-stone-100 bg-white shrink-0">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="輸入欲查詢之中文生字或詞彙（例如：學習、朋友、和、老師）"
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-800 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition-colors flex items-center gap-1.5 shadow-xs shrink-0"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>查詢</span>
            </button>
          </form>

          {/* Quick chip queries */}
          <div className="flex items-center gap-1.5 mt-2.5 text-xs text-stone-500 flex-wrap">
            <span>常見生詞範例：</span>
            {['學習', '文化', '朋友', '垃圾', '星期', '和', '企業', '漂亮'].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  setQuery(chip);
                  // immediate search
                  setTimeout(() => {
                    fetch('/api/dictionary/lookup', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ query: chip, standard, script }),
                    })
                      .then((r) => r.json())
                      .then((d) => setResult(d))
                      .catch((e) => console.error(e));
                  }, 50);
                }}
                className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200">
              {errorMsg}
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-stone-400">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <p className="text-sm">正在連線檢索教育部辭典與華語等級資料庫...</p>
            </div>
          )}

          {!loading && result && (
            <div className="space-y-5 animate-fade-in">
              {/* Primary Headword & Phonetics Banner */}
              <div className="p-5 bg-gradient-to-br from-emerald-50/70 to-teal-50/40 border border-emerald-200/80 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-bold font-serif text-stone-900 tracking-wide">
                      {script === 'simplified' ? result.simplified : result.traditional}
                    </h2>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                      繁體：{result.traditional} | 簡體：{result.simplified}
                    </span>
                    <button
                      onClick={() => handlePlayAudio(result.word)}
                      title="朗讀發音"
                      className="p-1.5 text-emerald-700 hover:bg-emerald-100 rounded-full transition-colors"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Phonetics row */}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-2.5 text-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="text-stone-500 text-xs">注音：</span>
                      <span className="font-bold text-amber-800 font-mono text-base">{result.zhuyin}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-stone-500 text-xs">國語拼音：</span>
                      <span className="font-bold text-sky-800 font-mono">{result.pinyinTW}</span>
                    </div>
                    {result.pinyinCN && result.pinyinCN !== result.pinyinTW && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-stone-500 text-xs">普通話拼音：</span>
                        <span className="font-bold text-stone-700 font-mono">{result.pinyinCN}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Insert to whiteboard button */}
                <button
                  onClick={() => {
                    onInsertToWhiteboard(result);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-xs shadow-md transition-colors shrink-0"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>插入至白板教學卡</span>
                </button>
              </div>

              {/* Language Benchmark Cards (TOCFL / TBCL / HSK) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* TOCFL */}
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200">
                  <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs mb-1">
                    <Award className="w-4 h-4 text-blue-700" />
                    TOCFL 華語文測驗
                  </div>
                  <div className="text-sm font-semibold text-blue-800">
                    {result.tocflLevel || 'Band A (基礎)'}
                  </div>
                  <div className="text-[11px] text-blue-600 mt-0.5">臺灣華語檢定標準級數</div>
                </div>

                {/* TBCL */}
                <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200">
                  <div className="flex items-center gap-1.5 text-purple-900 font-bold text-xs mb-1">
                    <BookmarkCheck className="w-4 h-4 text-purple-700" />
                    TBCL 華語能力基準
                  </div>
                  <div className="text-sm font-semibold text-purple-800">
                    {result.tbclLevel || '第 1 級 (基礎核心)'}
                  </div>
                  <div className="text-[11px] text-purple-600 mt-0.5">臺灣華語文能力基準</div>
                </div>

                {/* HSK */}
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs mb-1">
                    <Sparkles className="w-4 h-4 text-amber-700" />
                    HSK 漢語水平考試
                  </div>
                  <div className="text-sm font-semibold text-amber-800">
                    {result.hskLevel || 'HSK 1 - 2 級'}
                  </div>
                  <div className="text-[11px] text-amber-600 mt-0.5">國際通用漢語評測標準</div>
                </div>
              </div>

              {/* Character Structure & Radical Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
                  <div className="text-xs text-stone-500">部首</div>
                  <div className="text-base font-bold text-stone-800 mt-0.5">{result.radical} 部</div>
                </div>
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
                  <div className="text-xs text-stone-500">總筆畫數</div>
                  <div className="text-base font-bold text-stone-800 mt-0.5">{result.totalStrokes || 8} 畫</div>
                </div>
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
                  <div className="text-xs text-stone-500">字體結構</div>
                  <div className="text-base font-bold text-stone-800 mt-0.5">{result.structure || '左右結構'}</div>
                </div>
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
                  <div className="text-xs text-stone-500">部首位置</div>
                  <div className="text-base font-bold text-stone-800 mt-0.5">{result.radicalPosition || '左側'}</div>
                </div>
              </div>

              {/* Pronunciation Differences explanation */}
              {result.phoneticDifferences && result.phoneticDifferences !== '讀音相同' && (
                <div className="p-3.5 bg-amber-50/80 border border-amber-200 text-amber-900 rounded-xl text-xs leading-relaxed">
                  <span className="font-bold">兩岸字音規範差異對照：</span>
                  {result.phoneticDifferences}
                </div>
              )}

              {/* Definitions and Classroom Examples */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  教育部辭典釋義與教學例句
                </h4>
                {result.definitions?.map((d, idx) => (
                  <div key={idx} className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-md">
                        {d.partOfSpeech || '名詞'}
                      </span>
                      <p className="text-sm font-semibold text-stone-800">{d.explanation}</p>
                    </div>
                    {d.examples && d.examples.length > 0 && (
                      <div className="pl-4 border-l-2 border-emerald-300 space-y-1 mt-1">
                        {d.examples.map((ex, eIdx) => (
                          <div key={eIdx} className="text-xs text-stone-600 flex items-center justify-between">
                            <span>• {ex}</span>
                            <button
                              onClick={() => handlePlayAudio(ex)}
                              title="朗讀例句"
                              className="text-stone-400 hover:text-emerald-700 p-1"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Polyphones */}
              {result.polyphones && result.polyphones.length > 0 && (
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="text-xs font-bold text-stone-700 mb-2">多音字讀音整理：</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {result.polyphones.map((p, idx) => (
                      <div key={idx} className="p-2 bg-white rounded-lg border border-stone-200">
                        <span className="font-bold text-sky-800">{p.pronunciation}</span>
                        <span className="ml-1 font-mono text-amber-700">({p.zhuyin})</span>
                        {p.usage && <span className="text-stone-500 ml-1.5">— {p.usage}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
