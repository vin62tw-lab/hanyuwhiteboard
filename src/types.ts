export type ScriptType = 'traditional' | 'simplified';
export type RegionalStandard = 'taiwan' | 'mainland';
export type PhoneticDisplayMode = 'both' | 'zhuyin' | 'pinyin' | 'none';
export type BackgroundGridType = 'tianzige' | 'mizige' | 'lines' | 'dots' | 'blank';
export type ToolType = 'select' | 'hand' | 'pen' | 'highlighter' | 'eraser' | 'laser' | 'text';

export type FontFamilyOption = 
  | 'kaishu'      // 標楷體 (Standard KaiTi)
  | 'songti'      // 宋體 / 明體
  | 'heiti'       // 黑體 (Gothic / Sans)
  | 'fangsong'    // 仿宋體
  | 'calligraphy'; // 毛筆書法體

export interface CharacterPhonetic {
  char: string;
  traditionalChar: string;
  simplifiedChar: string;
  zhuyin: string;        // e.g. "ㄓㄨㄥ" or "ㄏㄢˋ"
  zhuyinTone: string;    // e.g. "" (1st), "ˊ" (2nd), "ˇ" (3rd), "ˋ" (4th), "˙" (neutral)
  pinyin: string;        // e.g. "zhōng"
  pinyinTone: number;    // 1, 2, 3, 4, 5
  radical?: string;      // e.g. "言"
  remaining?: string;    // e.g. "吾"
  polyphones?: Array<{
    pinyin: string;
    zhuyin: string;
    meaning?: string;
  }>;
  customOverridden?: boolean;
}

export interface TextBlockItem {
  id: string;
  type: 'text';
  x: number;
  y: number;
  width?: number;
  height?: number;
  rawText: string;
  characters: CharacterPhonetic[];
  fontSize: number;          // in px e.g. 48
  letterSpacing: number;     // in px e.g. 12
  fontFamily: FontFamilyOption;
  textColor: string;         // e.g. "#1e293b"
  radicalColor: string;      // e.g. "#dc2626"
  highlightRadical: boolean; // whether to color the radical
  displayMode?: PhoneticDisplayMode;
  showTianzige: boolean;     // whether each character has a Tianzige box background
  tianzigeColor?: string;
}

export interface DrawingPoint {
  x: number;
  y: number;
  pressure?: number;
}

export interface DrawingStroke {
  id: string;
  type: 'stroke';
  tool: 'pen' | 'highlighter' | 'laser' | 'eraser';
  points: DrawingPoint[];
  color: string;
  width: number;
  opacity: number;
  createdAt?: number;
}

export type WhiteboardElement = TextBlockItem | DrawingStroke;

export interface DictionaryData {
  word: string;
  traditional: string;
  simplified: string;
  zhuyin: string;
  pinyinTW: string;
  pinyinCN: string;
  phoneticDifferences?: string;
  radical: string;
  radicalStrokes?: number;
  totalStrokes?: number;
  radicalPosition?: string;
  structure?: string;
  characterBreakdown?: Array<{
    char: string;
    radical: string;
    remainingComponent: string;
    strokes: number;
    zhuyin: string;
    pinyin: string;
  }>;
  definitions: Array<{
    partOfSpeech: string;
    explanation: string;
    examples: string[];
  }>;
  tocflLevel?: string;
  tbclLevel?: string;
  hskLevel?: string;
  moeDictRef?: string;
  polyphones?: Array<{
    pronunciation: string;
    zhuyin: string;
    usage?: string;
  }>;
  strokeOrderTips?: string;
}

export interface StrokeAnimationData {
  char: string;
  strokesCount: number;
  radical: string;
  remainingComponent?: string;
  strokeSteps: string[];
  strokeRule?: string;
  svgPaths?: string[];
}
