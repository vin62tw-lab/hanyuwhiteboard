import { pinyin, convert } from 'pinyin-pro';
import { CharacterPhonetic, RegionalStandard, ScriptType } from '../types';

// Taiwan MOE standard vs Mainland difference mappings
export const REGIONAL_DIFFERENCES: Record<string, {
  taiwanPinyin: string;
  taiwanZhuyin: string;
  mainlandPinyin: string;
  mainlandZhuyin: string;
  notes: string;
}> = {
  '和': {
    taiwanPinyin: 'hàn',
    taiwanZhuyin: 'ㄏㄢˋ',
    mainlandPinyin: 'hé',
    mainlandZhuyin: 'ㄏㄜˊ',
    notes: '作「與、及、跟」時，臺灣教育部標準讀ㄏㄢˋ，大陸普通話讀 hé。'
  },
  '期': {
    taiwanPinyin: 'qí',
    taiwanZhuyin: 'ㄑㄧˊ',
    mainlandPinyin: 'qī',
    mainlandZhuyin: 'ㄑㄧ',
    notes: '星期、期待，臺灣讀二聲 qí (ㄑㄧˊ)，大陸讀一聲 qī (ㄑㄧ)。'
  },
  '微': {
    taiwanPinyin: 'wéi',
    taiwanZhuyin: 'ㄨㄟˊ',
    mainlandPinyin: 'wēi',
    mainlandZhuyin: 'ㄨㄟ',
    notes: '微笑、微妙，臺灣教育部標準讀二聲 wéi (ㄨㄟˊ)，大陸讀一聲 wēi (ㄨㄟ)。'
  },
  '質': {
    taiwanPinyin: 'zhí',
    taiwanZhuyin: 'ㄓˊ',
    mainlandPinyin: 'zhì',
    mainlandZhuyin: 'ㄓˋ',
    notes: '質量、品質，臺灣標準讀二聲 zhí (ㄓˊ)，大陸讀四聲 zhì (ㄓˋ)。'
  },
  '企': {
    taiwanPinyin: 'qì',
    taiwanZhuyin: 'ㄑㄧˋ',
    mainlandPinyin: 'qǐ',
    mainlandZhuyin: 'ㄑㄧˇ',
    notes: '企業、企圖，臺灣讀四聲 qì (ㄑㄧˋ)，大陸讀三聲 qǐ (ㄑㄧˇ)。'
  },
  '括': {
    taiwanPinyin: 'guā',
    taiwanZhuyin: 'ㄍㄨㄚ',
    mainlandPinyin: 'kuò',
    mainlandZhuyin: 'ㄎㄨㄛˋ',
    notes: '包括、括號，臺灣標準讀 guā (ㄍㄨㄚ)，大陸讀 kuò (ㄎㄨㄛˋ)。'
  },
  '血': {
    taiwanPinyin: 'xiě',
    taiwanZhuyin: 'ㄒㄧㄝˇ',
    mainlandPinyin: 'xuè',
    mainlandZhuyin: 'ㄒㄩㄝˋ',
    notes: '血液，臺灣口語常讀 xiě，書面亦作 xuè；大陸多讀 xuè。'
  },
  '穴': {
    taiwanPinyin: 'xuè',
    taiwanZhuyin: 'ㄒㄩㄝˋ',
    mainlandPinyin: 'xué',
    mainlandZhuyin: 'ㄒㄩㄝˊ',
    notes: '洞穴、穴位，臺灣教育部讀四聲 xuè (ㄒㄩㄝˋ)，大陸讀二聲 xué (ㄒㄩㄝˊ)。'
  },
  '誰': {
    taiwanPinyin: 'shéi',
    taiwanZhuyin: 'ㄕㄟˊ',
    mainlandPinyin: 'shuí',
    mainlandZhuyin: 'ㄕㄨㄟˊ',
    notes: '臺灣標準以 shéi (ㄕㄟˊ) 為主，大陸辭書以 shuí 為規範音（亦口語讀 shéi）。'
  },
  '滑': {
    taiwanPinyin: 'gǔ',
    taiwanZhuyin: 'ㄍㄨˇ',
    mainlandPinyin: 'huá',
    mainlandZhuyin: 'ㄏㄨㄚˊ',
    notes: '滑稽一詞，臺灣教育部標準讀 gǔ jī (ㄍㄨˇ ㄐㄧ)，大陸讀 huá jī (ㄏㄨㄚˊ ㄐㄧ)。'
  },
  '垃': {
    taiwanPinyin: 'lè',
    taiwanZhuyin: 'ㄌㄜˋ',
    mainlandPinyin: 'lā',
    mainlandZhuyin: 'ㄌㄚ',
    notes: '垃圾，臺灣讀 lè sè (ㄌㄜˋ ㄙㄜˋ)，大陸讀 lā jī (ㄌㄚ ㄐㄧ)。'
  },
  '圾': {
    taiwanPinyin: 'sè',
    taiwanZhuyin: 'ㄙㄜˋ',
    mainlandPinyin: 'jī',
    mainlandZhuyin: 'ㄐㄧ',
    notes: '垃圾，臺灣讀 lè sè (ㄌㄜˋ ㄙㄜˋ)，大陸讀 lā jī (ㄌㄚ ㄐㄧ)。'
  },
  '識': {
    taiwanPinyin: 'shí',
    taiwanZhuyin: 'ㄕˊ',
    mainlandPinyin: 'shi',
    mainlandZhuyin: '˙ㄕ',
    notes: '認識，臺灣讀二聲 shí (ㄕˊ)，大陸常輕聲 shi (˙ㄕ)。'
  },
};

// Common polyphone database for pedagogical correction
export const COMMON_POLYPHONES: Record<string, Array<{ pinyin: string; zhuyin: string; meaning: string }>> = {
  '行': [
    { pinyin: 'xíng', zhuyin: 'ㄒㄧㄥˊ', meaning: '行走、可行、行動' },
    { pinyin: 'háng', zhuyin: 'ㄏㄤˊ', meaning: '銀行、行列、行業' },
    { pinyin: 'xìng', zhuyin: 'ㄒㄧㄥˋ', meaning: '品行、行檢 (古音/少用)' },
  ],
  '重': [
    { pinyin: 'zhòng', zhuyin: 'ㄓㄨㄥˋ', meaning: '重量、重要、沈重' },
    { pinyin: 'chóng', zhuyin: 'ㄔㄨㄥˊ', meaning: '重複、重陽、重逢' },
  ],
  '得': [
    { pinyin: 'dé', zhuyin: 'ㄉㄜˊ', meaning: '得到、心得、得意' },
    { pinyin: 'děi', zhuyin: 'ㄉㄟˇ', meaning: '必須（如：你得去）' },
    { pinyin: 'de', zhuyin: '˙ㄉㄜ', meaning: '助詞（如：跑得快）' },
  ],
  '地': [
    { pinyin: 'dì', zhuyin: 'ㄉㄧˋ', meaning: '土地、地方、地球' },
    { pinyin: 'de', zhuyin: '˙ㄉㄜ', meaning: '結構助詞（如：慢慢地走）' },
  ],
  '的': [
    { pinyin: 'de', zhuyin: '˙ㄉㄜ', meaning: '定語標記（如：我的書）' },
    { pinyin: 'dí', zhuyin: 'ㄉㄧˊ', meaning: '的確、的當' },
    { pinyin: 'dì', zhuyin: 'ㄉㄧˋ', meaning: '目的、標的、箭靶' },
  ],
  '著': [
    { pinyin: 'zhe', zhuyin: '˙ㄓㄜ', meaning: '狀態進行（如：看著、聽著）' },
    { pinyin: 'zhù', zhuyin: 'ㄓㄨˋ', meaning: '著作、著名、顯著' },
    { pinyin: 'zháo', zhuyin: 'ㄓㄠˊ', meaning: '著急、著涼、著火' },
    { pinyin: 'zhuó', zhuyin: 'ㄓㄨㄛˊ', meaning: '著想、著手、穿著' },
  ],
  '長': [
    { pinyin: 'cháng', zhuyin: 'ㄔㄤˊ', meaning: '長短、長久、專長' },
    { pinyin: 'zhǎng', zhuyin: 'ㄓㄤˇ', meaning: '長大、校長、生長' },
  ],
  '教': [
    { pinyin: 'jiāo', zhuyin: 'ㄐㄧㄠ', meaning: '傳授（如：教書、教課）' },
    { pinyin: 'jiào', zhuyin: 'ㄐㄧㄠˋ', meaning: '教育、教學、教室、宗教' },
  ],
  '覺': [
    { pinyin: 'jué', zhuyin: 'ㄐㄩㄝˊ', meaning: '感覺、覺得、自覺' },
    { pinyin: 'jiào', zhuyin: 'ㄐㄧㄠˋ', meaning: '睡覺、午覺' },
  ],
  '樂': [
    { pinyin: 'lè', zhuyin: 'ㄌㄜˋ', meaning: '快樂、歡樂、樂觀' },
    { pinyin: 'yuè', zhuyin: 'ㄩㄝˋ', meaning: '音樂、樂器、樂譜' },
    { pinyin: 'yào', zhuyin: 'ㄧㄠˋ', meaning: '喜好（如：仁者樂山）' },
  ],
  '便': [
    { pinyin: 'biàn', zhuyin: 'ㄅㄧㄢˋ', meaning: '方便、便利、便條' },
    { pinyin: 'pián', zhuyin: 'ㄆㄧㄢˊ', meaning: '便宜' },
  ],
  '還': [
    { pinyin: 'hái', zhuyin: 'ㄏㄞˊ', meaning: '仍然、還有、還是' },
    { pinyin: 'huán', zhuyin: 'ㄏㄨㄢˊ', meaning: '歸還、償還、還書' },
  ],
  '會': [
    { pinyin: 'huì', zhuyin: 'ㄏㄨㄟˋ', meaning: '開會、學會、機會' },
    { pinyin: 'kuài', zhuyin: 'ㄎㄨㄞˋ', meaning: '會計、財會' },
  ],
  '空': [
    { pinyin: 'kōng', zhuyin: 'ㄎㄨㄥ', meaning: '空間、天空、空曠' },
    { pinyin: 'kòng', zhuyin: 'ㄎㄨㄥˋ', meaning: '空閒、抽空、空位' },
  ],
  '為': [
    { pinyin: 'wèi', zhuyin: 'ㄨㄟˋ', meaning: '為了、因為、為什麼' },
    { pinyin: 'wéi', zhuyin: 'ㄨㄟˊ', meaning: '行為、成為、人為' },
  ],
  '傳': [
    { pinyin: 'chuán', zhuyin: 'ㄔㄨㄢˊ', meaning: '流傳、傳奇、傳統' },
    { pinyin: 'zhuàn', zhuyin: 'ㄓㄨㄢˋ', meaning: '傳記、自傳、水滸傳' },
  ],
  '好': [
    { pinyin: 'hǎo', zhuyin: 'ㄏㄠˇ', meaning: '美好、良好、很好' },
    { pinyin: 'hào', zhuyin: 'ㄏㄠˋ', meaning: '愛好、好客、好奇' },
  ],
};

// Simplified to Traditional mapping table for high frequency educational vocabulary
export const SIMPLIFIED_TO_TRADITIONAL: Record<string, string> = {
  '学': '學', '生': '生', '们': '們', '这': '這', '那': '那', '书': '書',
  '国': '國', '语': '語', '汉': '漢', '华': '華', '台': '臺', '湾': '灣',
  '师': '師', '课': '課', '说': '說', '话': '話', '认': '認', '识': '識',
  '写': '寫', '字': '字', '练': '練', '习': '習', '动': '動', '画': '畫',
  '笔': '筆', '顺': '順', '点': '點', '横': '橫', '竖': '豎', '撇': '撇',
  '红': '紅', '绿': '綠', '蓝': '藍', '黄': '黃', '黑': '黑', '白': '白',
  '两': '兩', '个': '個', '欢': '歡', '迎': '迎', '请': '請', '问': '問',
  '谢': '謝', '见': '見', '觉': '覺', '得': '得', '会': '會', '还': '還',
  '为': '為', '爱': '愛', '乐': '樂', '从': '從', '来': '來', '发': '發',
  '音': '音', '调': '調', '标': '標', '示': '示', '隐': '隱', '藏': '藏',
  '简': '簡', '体': '體', '繁': '繁', '楷': '楷', '树': '樹', '鸟': '鳥',
  '鱼': '魚', '猫': '貓', '龙': '龍', '风': '風', '车': '車', '门': '門',
  '时': '時', '间': '間', '现': '現', '在': '在', '进': '進', '步': '步',
  '读': '讀', '听': '聽', '电': '電', '脑': '腦', '网': '網', '络': '絡',
  '钱': '錢', '买': '買', '卖': '賣', '张': '張', '纸': '紙', '给': '給',
  '机': '機', '样': '樣', '变': '變', '过': '過', '选': '選', '择': '擇',
  '输': '輸', '出': '出', '查': '查', '询': '詢', '典': '典', '级': '級',
};

// Traditional to Simplified
export const TRADITIONAL_TO_SIMPLIFIED: Record<string, string> = Object.entries(SIMPLIFIED_TO_TRADITIONAL).reduce(
  (acc, [simp, trad]) => {
    acc[trad] = simp;
    return acc;
  },
  {} as Record<string, string>
);

// Map Pinyin to Zhuyin (Bopomofo) symbols with tone separation
export const PINYIN_TO_ZHUYIN_TABLE: Record<string, string> = {
  'b': 'ㄅ', 'p': 'ㄆ', 'm': 'ㄇ', 'f': 'ㄈ',
  'd': 'ㄉ', 't': 'ㄊ', 'n': 'ㄋ', 'l': 'ㄌ',
  'g': 'ㄍ', 'k': 'ㄎ', 'h': 'ㄏ',
  'j': 'ㄐ', 'q': 'ㄑ', 'x': 'ㄒ',
  'zh': 'ㄓ', 'ch': 'ㄔ', 'sh': 'ㄕ', 'r': 'ㄖ',
  'z': 'ㄗ', 'c': 'ㄘ', 's': 'ㄙ',
  'a': 'ㄚ', 'o': 'ㄛ', 'e': 'ㄜ', 'ie': 'ㄧㄝ', 'ye': 'ㄧㄝ',
  'ai': 'ㄞ', 'ei': 'ㄟ', 'ao': 'ㄠ', 'ou': 'ㄡ',
  'an': 'ㄢ', 'en': 'ㄣ', 'ang': 'ㄤ', 'eng': 'ㄥ', 'er': 'ㄦ',
  'i': 'ㄧ', 'u': 'ㄨ', 'v': 'ㄩ', 'ü': 'ㄩ',
  'ia': 'ㄧㄚ', 'iao': 'ㄧㄠ', 'ian': 'ㄧㄢ', 'iang': 'ㄧㄤ', 'iong': 'ㄩㄥ',
  'ua': 'ㄨㄚ', 'uo': 'ㄨㄛ', 'uai': 'ㄨㄞ', 'ui': 'ㄨㄟ', 'uan': 'ㄨㄢ',
  'un': 'ㄨㄣ', 'uang': 'ㄨㄤ', 'ong': 'ㄨㄥ',
  'ue': 'ㄩㄝ', 'üe': 'ㄩㄝ', 'uan-u': 'ㄩㄢ', 'ün': 'ㄩㄣ',
};

// Tone diacritics mapping for manual correction & pinyin display
export const TONE_MARKS: Record<string, [string, string, string, string, string]> = {
  'a': ['ā', 'á', 'ǎ', 'à', 'a'],
  'e': ['ē', 'é', 'ě', 'è', 'e'],
  'i': ['ī', 'í', 'ǐ', 'ì', 'i'],
  'o': ['ō', 'ó', 'ǒ', 'ò', 'o'],
  'u': ['ū', 'ú', 'ǔ', 'ù', 'u'],
  'ü': ['ǖ', 'ǘ', 'ǚ', 'ǜ', 'ü'],
  'v': ['ǖ', 'ǘ', 'ǚ', 'ǜ', 'ü'],
};

// Check if character is Chinese
export function isChineseChar(char: string): boolean {
  if (!char) return false;
  return /[\u4e00-\u9fa5\u3400-\u4dbf\uF900-\uFAFF]/.test(char);
}

// Convert character script
export function convertScript(char: string, targetScript: ScriptType): string {
  if (targetScript === 'simplified') {
    return TRADITIONAL_TO_SIMPLIFIED[char] || char;
  }
  return SIMPLIFIED_TO_TRADITIONAL[char] || char;
}

// Convert full text
export function convertTextScript(text: string, targetScript: ScriptType): string {
  return Array.from(text).map(c => convertScript(c, targetScript)).join('');
}

// Helper: decompose raw Zhuyin from pinyin-pro into base Zhuyin and Tone symbol
// Bopomofo tones: 1st tone (none), 2nd (ˊ), 3rd (ˇ), 4th (ˋ), 5th/neutral (˙)
export function parseZhuyinTone(zhuyinString: string): { baseZhuyin: string; zhuyinTone: string } {
  if (!zhuyinString) return { baseZhuyin: '', zhuyinTone: '' };
  
  let zhuyinTone = '';
  let baseZhuyin = zhuyinString;

  if (zhuyinString.includes('˙')) {
    zhuyinTone = '˙';
    baseZhuyin = zhuyinString.replace('˙', '');
  } else if (zhuyinString.includes('ˊ')) {
    zhuyinTone = 'ˊ';
    baseZhuyin = zhuyinString.replace('ˊ', '');
  } else if (zhuyinString.includes('ˇ')) {
    zhuyinTone = 'ˇ';
    baseZhuyin = zhuyinString.replace('ˇ', '');
  } else if (zhuyinString.includes('ˋ')) {
    zhuyinTone = 'ˋ';
    baseZhuyin = zhuyinString.replace('ˋ', '');
  }

  return { baseZhuyin, zhuyinTone };
}

// Parse Pinyin tone number from pinyin with mark
export function getToneNumber(py: string): number {
  if (/[āēīōūǖ]/.test(py)) return 1;
  if (/[áéíóúǘ]/.test(py)) return 2;
  if (/[ǎěǐǒǔǚ]/.test(py)) return 3;
  if (/[àèìòùǜ]/.test(py)) return 4;
  return 5;
}

// Convert raw pinyin syllable (with or without tone marks) to base Zhuyin (Bopomofo)
export function pinyinToZhuyin(py: string): string {
  if (!py) return '';
  const toneMap: Record<string, string> = {
    'ā': 'a', 'á': 'a', 'ǎ': 'a', 'à': 'a',
    'ē': 'e', 'é': 'e', 'ě': 'e', 'è': 'e',
    'ī': 'i', 'í': 'i', 'ǐ': 'i', 'ì': 'i',
    'ō': 'o', 'ó': 'o', 'ǒ': 'o', 'ò': 'o',
    'ū': 'u', 'ú': 'u', 'ǔ': 'u', 'ù': 'u',
    'ǖ': 'ü', 'ǘ': 'ü', 'ǚ': 'ü', 'ǜ': 'ü', 'v': 'ü'
  };
  let clean = '';
  for (const c of py.toLowerCase()) {
    clean += toneMap[c] || c;
  }
  clean = clean.replace(/[^a-zü]/g, '');
  if (!clean) return '';

  const SPECIALS: Record<string, string> = {
    'zhi': 'ㄓ', 'chi': 'ㄔ', 'shi': 'ㄕ', 'ri': 'ㄖ',
    'zi': 'ㄗ', 'ci': 'ㄘ', 'si': 'ㄙ',
    'yi': 'ㄧ', 'ye': 'ㄧㄝ', 'ya': 'ㄧㄚ', 'yao': 'ㄧㄠ', 'you': 'ㄧㄡ',
    'yan': 'ㄧㄢ', 'yin': 'ㄧㄣ', 'yang': 'ㄧㄤ', 'ying': 'ㄧㄥ', 'yong': 'ㄩㄥ',
    'wu': 'ㄨ', 'wa': 'ㄨㄚ', 'wo': 'ㄨㄛ', 'wai': 'ㄨㄞ', 'wei': 'ㄨㄟ',
    'wan': 'ㄨㄢ', 'wen': 'ㄨㄣ', 'wang': 'ㄨㄤ', 'weng': 'ㄨㄥ',
    'yu': 'ㄩ', 'yue': 'ㄩㄝ', 'yuan': 'ㄩㄢ', 'yun': 'ㄩㄣ',
    'er': 'ㄦ', 'a': 'ㄚ', 'o': 'ㄛ', 'e': 'ㄜ', 'ai': 'ㄞ', 'ei': 'ㄟ',
    'ao': 'ㄠ', 'ou': 'ㄡ', 'an': 'ㄢ', 'en': 'ㄣ', 'ang': 'ㄤ', 'eng': 'ㄥ'
  };
  if (SPECIALS[clean]) return SPECIALS[clean];

  const INITIALS = [
    { p: 'zh', z: 'ㄓ' }, { p: 'ch', z: 'ㄔ' }, { p: 'sh', z: 'ㄕ' },
    { p: 'b', z: 'ㄅ' }, { p: 'p', z: 'ㄆ' }, { p: 'm', z: 'ㄇ' }, { p: 'f', z: 'ㄈ' },
    { p: 'd', z: 'ㄉ' }, { p: 't', z: 'ㄊ' }, { p: 'n', z: 'ㄋ' }, { p: 'l', z: 'ㄌ' },
    { p: 'g', z: 'ㄍ' }, { p: 'k', z: 'ㄎ' }, { p: 'h', z: 'ㄏ' },
    { p: 'j', z: 'ㄐ' }, { p: 'q', z: 'ㄑ' }, { p: 'x', z: 'ㄒ' },
    { p: 'r', z: 'ㄖ' }, { p: 'z', z: 'ㄗ' }, { p: 'c', z: 'ㄘ' }, { p: 's', z: 'ㄙ' }
  ];

  let initZh = '';
  let finalStr = clean;
  let initP = '';

  for (const item of INITIALS) {
    if (clean.startsWith(item.p)) {
      initZh = item.z;
      initP = item.p;
      finalStr = clean.slice(item.p.length);
      break;
    }
  }

  // Handle j, q, x with u -> ü
  if ((initP === 'j' || initP === 'q' || initP === 'x') && finalStr.startsWith('u')) {
    finalStr = 'ü' + finalStr.slice(1);
  }

  const FINALS: Record<string, string> = {
    'a': 'ㄚ', 'o': 'ㄛ', 'e': 'ㄜ', 'ai': 'ㄞ', 'ei': 'ㄟ', 'ao': 'ㄠ', 'ou': 'ㄡ',
    'an': 'ㄢ', 'en': 'ㄣ', 'ang': 'ㄤ', 'eng': 'ㄥ', 'ong': 'ㄨㄥ',
    'i': 'ㄧ', 'ia': 'ㄧㄚ', 'iao': 'ㄧㄠ', 'ie': 'ㄧㄝ', 'iu': 'ㄧㄡ',
    'ian': 'ㄧㄢ', 'in': 'ㄧㄣ', 'iang': 'ㄧㄤ', 'ing': 'ㄧㄥ', 'iong': 'ㄩㄥ',
    'u': 'ㄨ', 'ua': 'ㄨㄚ', 'uo': 'ㄨㄛ', 'uai': 'ㄨㄞ', 'ui': 'ㄨㄟ',
    'uan': 'ㄨㄢ', 'un': 'ㄨㄣ', 'uang': 'ㄨㄤ', 'ueng': 'ㄨㄥ',
    'ü': 'ㄩ', 'üe': 'ㄩㄝ', 'üan': 'ㄩㄢ', 'ün': 'ㄩㄣ'
  };

  const finalZh = FINALS[finalStr] || '';
  return initZh + finalZh;
}

// Map tone number to Zhuyin tone symbol
export function toneNumberToZhuyinTone(tone: number): string {
  switch (tone) {
    case 1: return '';
    case 2: return 'ˊ';
    case 3: return 'ˇ';
    case 4: return 'ˋ';
    case 5: return '˙';
    default: return '';
  }
}

// Change pinyin string tone mark to the requested tone number (1..5, where 5 is neutral tone)
export function changePinyinTone(pinyinStr: string, toneNum: number): string {
  if (!pinyinStr) return '';
  const cleanPy = pinyinStr.trim();
  const baseNone = convert(cleanPy, { format: 'toneNone' }).replace(/[0-9]/g, '');
  if (toneNum === 5 || toneNum === 0) {
    return baseNone;
  }
  if (toneNum >= 1 && toneNum <= 4) {
    const res = convert(`${baseNone}${toneNum}`, { format: 'numToSymbol' });
    return res || cleanPy;
  }
  return cleanPy;
}

// Process a single Chinese character with Taiwan/Mainland and Script awareness
export function analyzeCharacterPhonetic(
  char: string,
  options: {
    standard?: RegionalStandard;
    script?: ScriptType;
    previousChar?: string;
    nextChar?: string;
  } = {}
): CharacterPhonetic {
  const { standard = 'taiwan', script = 'traditional' } = options;

  if (!isChineseChar(char)) {
    return {
      char,
      traditionalChar: char,
      simplifiedChar: char,
      zhuyin: '',
      zhuyinTone: '',
      pinyin: '',
      pinyinTone: 5,
    };
  }

  const trad = SIMPLIFIED_TO_TRADITIONAL[char] || char;
  const simp = TRADITIONAL_TO_SIMPLIFIED[char] || char;
  const displayChar = script === 'simplified' ? simp : trad;

  // Check regional difference overrides first (e.g. 和 hàn vs hé)
  const regionalDiff = REGIONAL_DIFFERENCES[trad] || REGIONAL_DIFFERENCES[simp];
  if (regionalDiff) {
    const isTaiwan = standard === 'taiwan';
    const py = isTaiwan ? regionalDiff.taiwanPinyin : regionalDiff.mainlandPinyin;
    const zyFull = isTaiwan ? regionalDiff.taiwanZhuyin : regionalDiff.mainlandZhuyin;
    const { baseZhuyin, zhuyinTone } = parseZhuyinTone(zyFull);
    const toneNum = getToneNumber(py);

    return {
      char: displayChar,
      traditionalChar: trad,
      simplifiedChar: simp,
      zhuyin: baseZhuyin,
      zhuyinTone,
      pinyin: py,
      pinyinTone: toneNum,
      polyphones: COMMON_POLYPHONES[trad] || COMMON_POLYPHONES[simp],
    };
  }

  // Use pinyin-pro to generate base pinyin and zhuyin
  const py = pinyin(char, { toneType: 'symbol' }) || '';
  const toneNum = getToneNumber(py);
  const baseZhuyin = pinyinToZhuyin(py);
  const zhuyinTone = toneNumberToZhuyinTone(toneNum);

  const polyList = COMMON_POLYPHONES[trad] || COMMON_POLYPHONES[simp];

  return {
    char: displayChar,
    traditionalChar: trad,
    simplifiedChar: simp,
    zhuyin: baseZhuyin,
    zhuyinTone,
    pinyin: py,
    pinyinTone: toneNum,
    polyphones: polyList,
  };
}

// Convert an entire string of text into an array of CharacterPhonetic items
export function textToPhonetics(
  text: string,
  standardOrOptions?: RegionalStandard | { standard?: RegionalStandard; script?: ScriptType },
  maybeScript?: ScriptType
): CharacterPhonetic[] {
  let standard: RegionalStandard = 'taiwan';
  let script: ScriptType = 'traditional';

  if (typeof standardOrOptions === 'string') {
    standard = standardOrOptions;
    if (maybeScript) script = maybeScript;
  } else if (standardOrOptions && typeof standardOrOptions === 'object') {
    if (standardOrOptions.standard) standard = standardOrOptions.standard;
    if (standardOrOptions.script) script = standardOrOptions.script;
  }

  const chars = Array.from(text);
  return chars.map((ch, idx) => {
    return analyzeCharacterPhonetic(ch, {
      standard,
      script,
      previousChar: chars[idx - 1],
      nextChar: chars[idx + 1],
    });
  });
}
