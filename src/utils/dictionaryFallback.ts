import { DictionaryData, RegionalStandard, ScriptType } from '../types';
import { textToPhonetics, REGIONAL_DIFFERENCES } from './phonetics';
import { CHARACTER_RADICALS } from './radicals';
import { getGenericStrokeData } from './strokeData';

export function getOfflineDictionaryData(
  query: string,
  standard: RegionalStandard = 'taiwan',
  script: ScriptType = 'traditional'
): DictionaryData {
  const chars = textToPhonetics(query, standard, script);
  const firstChar = chars[0]?.char || query[0] || '字';
  const radicalInfo = CHARACTER_RADICALS[firstChar];
  const strokeInfo = getGenericStrokeData(firstChar, radicalInfo?.radical, radicalInfo?.strokeCount || 8);

  const twPhonetics = textToPhonetics(query, 'taiwan', 'traditional');
  const cnPhonetics = textToPhonetics(query, 'mainland', 'simplified');

  const traditional = twPhonetics.map((c) => c.char).join('');
  const simplified = cnPhonetics.map((c) => c.char).join('');
  const zhuyin = twPhonetics.map((c) => c.zhuyin).filter(Boolean).join(' ');
  const pinyinTW = twPhonetics.map((c) => c.pinyin).filter(Boolean).join(' ');
  const pinyinCN = cnPhonetics.map((c) => c.pinyin).filter(Boolean).join(' ');

  // Look for regional difference notes
  let diffNote = '';
  for (const c of chars) {
    if (REGIONAL_DIFFERENCES[c.char]) {
      diffNote = REGIONAL_DIFFERENCES[c.char].notes;
      break;
    }
  }

  const characterBreakdown = chars.map((c) => {
    const rad = CHARACTER_RADICALS[c.char];
    const sData = getGenericStrokeData(c.char, rad?.radical, rad?.strokeCount || 8);
    return {
      char: c.char,
      radical: rad ? rad.radical : sData.radical || '一',
      remainingComponent: rad ? rad.remaining : '部首外筆畫',
      strokes: rad ? rad.strokeCount : sData.strokesCount || 1,
      zhuyin: c.zhuyin || '',
      pinyin: c.pinyin || '',
    };
  });

  const totalStrokes = characterBreakdown.reduce((sum, item) => sum + item.strokes, 0);

  return {
    word: query,
    traditional,
    simplified,
    zhuyin,
    pinyinTW,
    pinyinCN,
    phoneticDifferences: diffNote || undefined,
    radical: radicalInfo?.radical || strokeInfo.radical || '字',
    totalStrokes,
    structure: radicalInfo ? `結構：${radicalInfo.position === 'left' ? '左右結構' : radicalInfo.position === 'top' ? '上下結構' : '包圍或獨體'}` : '漢字標準結構',
    characterBreakdown,
    definitions: [
      {
        partOfSpeech: '釋義',
        explanation: `「${query}」之繁簡對照與語音讀法標註。${diffNote ? diffNote : '標準華語詞彙，具備正體、簡體與兩岸拼音及注音對照。'}`,
        examples: [`學習「${query}」的正確筆順與標準發音。`],
      },
    ],
    strokeOrderTips: `依漢字標準書寫原則：「先橫後豎、先撇後捺、從上到下、從左到右、先外後內再封口」。`,
  };
}
