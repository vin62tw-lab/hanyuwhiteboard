import React, { useState } from 'react';
import { X, Volume2, Check, RotateCcw, Edit3 } from 'lucide-react';
import { CharacterPhonetic, RegionalStandard } from '../types';
import {
  REGIONAL_DIFFERENCES,
  toneNumberToZhuyinTone,
  changePinyinTone,
  getToneNumber,
} from '../utils/phonetics';

interface PronunciationModalProps {
  charData: CharacterPhonetic;
  standard: RegionalStandard;
  onSave: (updated: CharacterPhonetic) => void;
  onClose: () => void;
}

export const PronunciationModal: React.FC<PronunciationModalProps> = ({
  charData,
  standard,
  onSave,
  onClose,
}) => {
  const [pinyin, setPinyin] = useState(charData.pinyin);
  const [zhuyin, setZhuyin] = useState(charData.zhuyin);
  const [zhuyinTone, setZhuyinTone] = useState(charData.zhuyinTone);
  const [pinyinTone, setPinyinTone] = useState(charData.pinyinTone);

  const regionalDiff = REGIONAL_DIFFERENCES[charData.traditionalChar] || REGIONAL_DIFFERENCES[charData.simplifiedChar];

  // Play browser TTS pronunciation
  const handlePlayVoice = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(charData.char);
      utterance.lang = standard === 'taiwan' ? 'zh-TW' : 'zh-CN';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSelectPolyphone = (poly: { pinyin: string; zhuyin: string }) => {
    setPinyin(poly.pinyin);
    const toneNum = getToneNumber(poly.pinyin);
    setPinyinTone(toneNum);

    // parse zhuyin tone
    let base = poly.zhuyin;
    let tone = '';
    if (poly.zhuyin.includes('˙')) {
      tone = '˙';
      base = poly.zhuyin.replace('˙', '');
    } else if (poly.zhuyin.includes('ˊ')) {
      tone = 'ˊ';
      base = poly.zhuyin.replace('ˊ', '');
    } else if (poly.zhuyin.includes('ˇ')) {
      tone = 'ˇ';
      base = poly.zhuyin.replace('ˇ', '');
    } else if (poly.zhuyin.includes('ˋ')) {
      tone = 'ˋ';
      base = poly.zhuyin.replace('ˋ', '');
    }
    setZhuyin(base);
    setZhuyinTone(tone || toneNumberToZhuyinTone(toneNum));
  };

  // 選擇聲調：同時自動修改注音聲調與拼音聲調
  const handleSetTone = (toneNum: number) => {
    setPinyinTone(toneNum);
    setZhuyinTone(toneNumberToZhuyinTone(toneNum));

    // 同步自動修改拼音的調號
    if (pinyin) {
      const updatedPinyin = changePinyinTone(pinyin, toneNum);
      if (updatedPinyin) {
        setPinyin(updatedPinyin);
      }
    }
  };

  const handleSave = () => {
    let finalZhuyin = zhuyin.trim();
    let finalZhuyinTone = zhuyinTone;
    if (finalZhuyin.includes('˙')) {
      finalZhuyinTone = '˙';
      finalZhuyin = finalZhuyin.replace(/˙/g, '');
    } else if (finalZhuyin.includes('ˊ')) {
      finalZhuyinTone = 'ˊ';
      finalZhuyin = finalZhuyin.replace(/ˊ/g, '');
    } else if (finalZhuyin.includes('ˇ')) {
      finalZhuyinTone = 'ˇ';
      finalZhuyin = finalZhuyin.replace(/ˇ/g, '');
    } else if (finalZhuyin.includes('ˋ')) {
      finalZhuyinTone = 'ˋ';
      finalZhuyin = finalZhuyin.replace(/ˋ/g, '');
    }

    const finalToneNum = pinyinTone || getToneNumber(pinyin);

    onSave({
      ...charData,
      pinyin,
      zhuyin: finalZhuyin,
      zhuyinTone: finalZhuyinTone,
      pinyinTone: finalToneNum,
      customOverridden: true,
    });
    onClose();
  };

  const handleReset = () => {
    setPinyin(charData.pinyin);
    setZhuyin(charData.zhuyin);
    setZhuyinTone(charData.zhuyinTone);
    setPinyinTone(charData.pinyinTone);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-stone-800 text-base">正音與聲調修正</h3>
              <p className="text-xs text-stone-500">
                目前規範：{standard === 'taiwan' ? '臺灣教育部標準' : '大陸普通話規範'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Character Preview Card */}
        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-center justify-center gap-6 p-4 bg-amber-50/60 rounded-xl border border-amber-200/50">
            <div className="w-20 h-20 rounded-lg border-2 border-red-300 bg-white relative flex items-center justify-center shadow-xs">
              {/* Tianzige crosslines */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-full border-t border-dashed border-red-200" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="h-full border-l border-dashed border-red-200" />
              </div>
              <span className="text-4xl font-serif text-stone-900 z-10 font-bold">
                {charData.char}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500 font-medium">拼音：</span>
                <span className="text-lg font-bold text-sky-700">{pinyin}</span>
                <button
                  onClick={handlePlayVoice}
                  title="朗讀發音"
                  className="p-1 text-sky-600 hover:bg-sky-100 rounded-md transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500 font-medium">注音：</span>
                <span className="text-lg font-bold text-amber-700 font-mono">
                  {zhuyin}{zhuyinTone || ' (一聲)'}
                </span>
              </div>
            </div>
          </div>

          {/* Regional difference tip */}
          {regionalDiff && (
            <div className="text-xs bg-blue-50 border border-blue-200 text-blue-800 p-2.5 rounded-lg leading-relaxed">
              <span className="font-semibold">兩岸讀音提示：</span> {regionalDiff.notes}
            </div>
          )}

          {/* Common Polyphone Quick Selection */}
          {charData.polyphones && charData.polyphones.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-stone-600">常見多音字讀音切換：</label>
              <div className="grid grid-cols-2 gap-2">
                {charData.polyphones.map((poly, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectPolyphone(poly)}
                    className={`flex flex-col items-start p-2 rounded-lg border text-left transition-all ${
                      pinyin === poly.pinyin
                        ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500'
                        : 'border-stone-200 hover:border-stone-300 bg-stone-50 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-stone-800 text-sm">{poly.pinyin}</span>
                      <span className="text-xs font-mono text-amber-700 font-medium">{poly.zhuyin}</span>
                    </div>
                    {poly.meaning && (
                      <span className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">{poly.meaning}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tone selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-stone-600">選擇聲調：</label>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { num: 1, label: '一聲 (陰平)', mark: '—' },
                { num: 2, label: '二聲 (陽平)', mark: 'ˊ' },
                { num: 3, label: '三聲 (上聲)', mark: 'ˇ' },
                { num: 4, label: '四聲 (去聲)', mark: 'ˋ' },
                { num: 5, label: '五聲 (輕聲)', mark: '˙' },
              ].map(t => (
                <button
                  key={t.num}
                  onClick={() => handleSetTone(t.num)}
                  className={`py-2 px-1.5 rounded-lg border text-center transition-all ${
                    pinyinTone === t.num || (zhuyinTone === '' && t.num === 1) || (zhuyinTone === t.mark)
                      ? 'bg-amber-600 text-white border-amber-600 font-bold shadow-xs'
                      : 'border-stone-200 text-stone-700 hover:bg-stone-100 text-xs'
                  }`}
                >
                  <div className="text-xs font-bold">{t.num} 聲</div>
                  <div
                    className="text-base font-black leading-none mt-1"
                    style={{
                      fontFamily: '"DFKai-SB", "BiauKai", "KaiTi", "Noto Sans TC", sans-serif',
                    }}
                  >
                    {t.mark}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Manual input override */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-stone-600 block mb-1">手動修改拼音：</label>
              <input
                type="text"
                value={pinyin}
                onChange={(e) => {
                  const val = e.target.value;
                  setPinyin(val);
                  const detectedTone = getToneNumber(val);
                  if (detectedTone >= 1 && detectedTone <= 5) {
                    setPinyinTone(detectedTone);
                    setZhuyinTone(toneNumberToZhuyinTone(detectedTone));
                  }
                }}
                className="w-full px-2.5 py-1.5 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden font-mono"
                placeholder="例如: zhōng"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-600 block mb-1">手動修改注音符號：</label>
              <input
                type="text"
                value={zhuyin}
                onChange={(e) => {
                  const val = e.target.value;
                  let toneSym = '';
                  let base = val;
                  if (val.includes('˙')) { toneSym = '˙'; base = val.replace(/˙/g, ''); }
                  else if (val.includes('ˊ')) { toneSym = 'ˊ'; base = val.replace(/ˊ/g, ''); }
                  else if (val.includes('ˇ')) { toneSym = 'ˇ'; base = val.replace(/ˇ/g, ''); }
                  else if (val.includes('ˋ')) { toneSym = 'ˋ'; base = val.replace(/ˋ/g, ''); }
                  setZhuyin(base);
                  if (toneSym) {
                    setZhuyinTone(toneSym);
                    const toneMap: Record<string, number> = { 'ˊ': 2, 'ˇ': 3, 'ˋ': 4, '˙': 5 };
                    const tn = toneMap[toneSym] || 1;
                    setPinyinTone(tn);
                    if (pinyin) {
                      setPinyin(changePinyinTone(pinyin, tn));
                    }
                  }
                }}
                className="w-full px-2.5 py-1.5 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden font-mono"
                placeholder="例如: ㄓㄨㄥ"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            重設預設值
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-stone-600 hover:bg-stone-200 rounded-lg transition-colors font-medium"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors font-semibold shadow-xs"
            >
              <Check className="w-4 h-4" />
              套用正音
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
