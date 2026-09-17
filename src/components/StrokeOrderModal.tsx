import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Sparkles, BookOpen } from 'lucide-react';
import { getGenericStrokeData, STROKE_LIBRARY, StrokePathData } from '../utils/strokeData';

interface StrokeOrderModalProps {
  initialChar?: string;
  onClose: () => void;
}

export const StrokeOrderModal: React.FC<StrokeOrderModalProps> = ({
  initialChar = '中',
  onClose,
}) => {
  const [char, setChar] = useState(initialChar);
  const [currentStep, setCurrentStep] = useState(0); // 0 = empty, N = show up to stroke N
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // 1x, 1.5x, 2x
  const [strokeData, setStrokeData] = useState<StrokePathData>(() => {
    return STROKE_LIBRARY[initialChar] || getGenericStrokeData(initialChar);
  });
  const [loadingAiData, setLoadingAiData] = useState(false);
  const [aiRule, setAiRule] = useState<string>('');
  const [aiSteps, setAiSteps] = useState<string[]>([]);

  const animTimerRef = useRef<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Fetch stroke order details for any character
  useEffect(() => {
    let active = true;
    const baseData = STROKE_LIBRARY[char] || getGenericStrokeData(char);
    setStrokeData(baseData);
    setCurrentStep(0);
    setIsPlaying(false);

    // Call server endpoint for AI enhanced stroke rules and steps
    const fetchAiStroke = async () => {
      setLoadingAiData(true);
      try {
        const res = await fetch('/api/character/stroke-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ char }),
        });
        if (res.ok) {
          const json = await res.json();
          if (active && json.strokeSteps) {
            setAiRule(json.strokeRule || '');
            setAiSteps(json.strokeSteps || []);
          }
        }
      } catch (err) {
        console.error('Failed to load AI stroke steps:', err);
      } finally {
        if (active) setLoadingAiData(false);
      }
    };

    fetchAiStroke();

    return () => {
      active = false;
      if (animTimerRef.current) clearInterval(animTimerRef.current);
    };
  }, [char]);

  // Handle Play / Pause animation loop
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = Math.round(900 / speed);
      animTimerRef.current = window.setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= strokeData.steps.length) {
            // Replay from beginning with brief pause
            return 0;
          }
          return prev + 1;
        });
      }, intervalMs);
    } else {
      if (animTimerRef.current) {
        clearInterval(animTimerRef.current);
      }
    }
    return () => {
      if (animTimerRef.current) clearInterval(animTimerRef.current);
    };
  }, [isPlaying, strokeData.steps.length, speed]);

  const handleNext = () => {
    setIsPlaying(false);
    setCurrentStep((prev) => Math.min(strokeData.steps.length, prev + 1));
  };

  const handlePrev = () => {
    setIsPlaying(false);
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const activeStepInfo = strokeData.steps[currentStep - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-100 text-red-700 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-800 text-lg">中文字筆順教學與動畫示範</h3>
              <p className="text-xs text-stone-500">標準教育部楷書筆順規範與逐步示範</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col md:flex-row gap-6 items-center">
          {/* Main Tianzige Canvas Stage */}
          <div className="flex flex-col items-center">
            <div className="relative w-64 h-64 border-4 border-red-500/80 rounded-2xl bg-amber-50/30 shadow-inner flex items-center justify-center overflow-hidden">
              {/* Tianzige grid guide */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="w-full h-full border border-red-200" />
                {/* Horizontal cross */}
                <div className="absolute top-1/2 left-0 w-full border-t-2 border-dashed border-red-300" />
                {/* Vertical cross */}
                <div className="absolute left-1/2 top-0 h-full border-l-2 border-dashed border-red-300" />
                {/* Diagonal lines (Mizige) */}
                <svg className="absolute inset-0 w-full h-full stroke-red-200/50 stroke-1 stroke-dasharray-4 pointer-events-none">
                  <line x1="0" y1="0" x2="100%" y2="100%" />
                  <line x1="100%" y1="0" x2="0" y2="100%" />
                </svg>
              </div>

              {/* Watermark character background */}
              <div className="absolute inset-0 flex items-center justify-center text-[180px] font-serif text-stone-200 select-none pointer-events-none">
                {char}
              </div>

              {/* Animated SVG strokes */}
              <svg
                ref={svgRef}
                viewBox="0 0 1024 1024"
                className="w-full h-full z-10 p-4"
              >
                {strokeData.steps.map((st, idx) => {
                  const isVisible = idx < currentStep;
                  const isCurrent = idx === currentStep - 1;
                  if (!isVisible) return null;

                  return (
                    <path
                      key={st.strokeNum}
                      d={st.path}
                      fill="none"
                      stroke={isCurrent ? '#dc2626' : '#1e293b'}
                      strokeWidth={isCurrent ? '52' : '44'}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`transition-all duration-300 ${isCurrent ? 'animate-pulse' : ''}`}
                    />
                  );
                })}
              </svg>

              {/* Step indicator badge */}
              <div className="absolute top-3 left-3 bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                筆劃：{currentStep} / {strokeData.steps.length}
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={handleReset}
                title="重頭開始"
                className="p-2 border border-stone-200 hover:bg-stone-100 rounded-xl text-stone-600 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={handlePrev}
                disabled={currentStep <= 0}
                title="上一筆"
                className="p-2 border border-stone-200 hover:bg-stone-100 disabled:opacity-30 rounded-xl text-stone-600 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm shadow-md transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? '暫停' : '播放筆順'}</span>
              </button>
              <button
                onClick={handleNext}
                disabled={currentStep >= strokeData.steps.length}
                title="下一筆"
                className="p-2 border border-stone-200 hover:bg-stone-100 disabled:opacity-30 rounded-xl text-stone-600 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Speed control */}
            <div className="flex items-center gap-1.5 mt-2.5 text-xs text-stone-500">
              <span>動畫速度：</span>
              {[0.75, 1, 1.5, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-2 py-0.5 rounded-md font-mono ${
                    speed === s ? 'bg-red-100 text-red-700 font-bold' : 'hover:bg-stone-100'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Stroke Detail & Writing Rules */}
          <div className="flex-1 flex flex-col justify-between w-full h-full">
            <div className="flex flex-col gap-3">
              {/* Character quick switch */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-stone-600 whitespace-nowrap">更換示範中文字：</label>
                <input
                  type="text"
                  maxLength={1}
                  value={char}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    if (val) setChar(val);
                  }}
                  className="w-12 h-9 text-center font-bold text-lg border-2 border-stone-300 rounded-lg focus:border-red-500 outline-hidden font-serif"
                />
                <span className="text-xs text-stone-400">（可輸入任意漢字）</span>
              </div>

              {/* Current Active Stroke Info Card */}
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                <div className="text-xs text-stone-500 font-medium mb-1">當前書寫筆畫：</div>
                {activeStepInfo ? (
                  <div>
                    <div className="text-base font-bold text-red-600">
                      第 {activeStepInfo.strokeNum} 筆：{activeStepInfo.name}
                    </div>
                    {activeStepInfo.directionTip && (
                      <div className="text-xs text-stone-600 mt-1">
                        👉 運筆技巧：{activeStepInfo.directionTip}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-stone-400 italic">
                    點擊「播放筆順」或「下一筆」開始示範
                  </div>
                )}
              </div>

              {/* Stroke Order Rules */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-stone-700 leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
                  <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                  筆順核心規則指南：
                </div>
                <p>{aiRule || strokeData.rules}</p>
              </div>

              {/* AI Steps List if available */}
              {aiSteps.length > 0 && (
                <div className="max-h-28 overflow-y-auto pr-1">
                  <div className="text-[11px] font-semibold text-stone-500 mb-1">教育部楷書筆劃序：</div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    {aiSteps.map((stepStr, idx) => (
                      <div
                        key={idx}
                        className={`p-1 rounded text-[11px] ${
                          idx + 1 === currentStep
                            ? 'bg-red-100 text-red-700 font-bold'
                            : 'text-stone-600 bg-stone-50'
                        }`}
                      >
                        {stepStr}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer action */}
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-end">
              <button
                onClick={onClose}
                className="px-4 py-1.5 text-xs bg-stone-800 hover:bg-stone-900 text-white font-medium rounded-lg transition-colors"
              >
                完成
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
