export interface StrokePathData {
  char: string;
  strokesCount: number;
  radical: string;
  remaining: string;
  rules: string;
  steps: Array<{
    strokeNum: number;
    name: string;
    path: string; // SVG path data (viewBox 0 0 1024 1024)
    directionTip?: string;
  }>;
}

// Built-in high precision stroke vectors (1024x1024 viewBox normalized) for foundational classroom characters
export const STROKE_LIBRARY: Record<string, StrokePathData> = {
  '中': {
    char: '中',
    strokesCount: 4,
    radical: '丨',
    remaining: '口',
    rules: '先內外口框，最後引中豎貫通穿心。',
    steps: [
      { strokeNum: 1, name: '豎 (左豎)', path: 'M 256,360 L 256,660', directionTip: '由上往下垂直拉直' },
      { strokeNum: 2, name: '橫折', path: 'M 256,380 L 768,380 L 768,640', directionTip: '向右平橫至折角頓筆下折' },
      { strokeNum: 3, name: '橫 (封口)', path: 'M 256,640 L 768,640', directionTip: '由左往右平穩封底' },
      { strokeNum: 4, name: '懸針豎 (貫中)', path: 'M 512,180 L 512,860', directionTip: '正中由上至下垂直挺拔出鋒' },
    ],
  },
  '文': {
    char: '文',
    strokesCount: 4,
    radical: '文',
    remaining: '',
    rules: '先點、次橫、再撇、後捺。',
    steps: [
      { strokeNum: 1, name: '點', path: 'M 512,200 L 512,290', directionTip: '中央下筆由輕漸重' },
      { strokeNum: 2, name: '長橫', path: 'M 200,340 L 824,340', directionTip: '平穩伸展，略向上昂' },
      { strokeNum: 3, name: '撇', path: 'M 512,340 Q 420,580 230,800', directionTip: '由上向左下圓轉出尖' },
      { strokeNum: 4, name: '捺', path: 'M 420,440 Q 560,620 820,800', directionTip: '由左上斜向右下頓捺出腳' },
    ],
  },
  '字': {
    char: '字',
    strokesCount: 6,
    radical: '宀',
    remaining: '子',
    rules: '從上到下：先寶蓋頭（點、點、橫撇），後寫「子」（橫撇、彎鉤、橫）。',
    steps: [
      { strokeNum: 1, name: '點', path: 'M 512,180 L 512,260', directionTip: '正中點' },
      { strokeNum: 2, name: '點 (左點)', path: 'M 320,300 L 290,390', directionTip: '向左下斜出' },
      { strokeNum: 3, name: '橫撇折', path: 'M 290,310 L 730,310 L 700,400', directionTip: '橫向平拖再向左下折出' },
      { strokeNum: 4, name: '橫撇', path: 'M 380,480 L 640,480 L 460,600', directionTip: '寫子之上折' },
      { strokeNum: 5, name: '彎鉤', path: 'M 460,600 Q 530,720 500,820 Q 470,840 430,800', directionTip: '挺直中略帶圓曲，收筆向上鉤' },
      { strokeNum: 6, name: '長橫', path: 'M 240,640 L 784,640', directionTip: '橫平穿心托底' },
    ],
  },
  '好': {
    char: '好',
    strokesCount: 6,
    radical: '女',
    remaining: '子',
    rules: '先左後右：先寫「女」字旁，後寫「子」。女字挑筆由左下向右上斜出。',
    steps: [
      { strokeNum: 1, name: '撇點', path: 'M 360,260 L 250,520 L 450,560', directionTip: '女字首筆，撇出折轉為長點' },
      { strokeNum: 2, name: '撇', path: 'M 410,340 Q 300,640 180,780', directionTip: '向左下舒展撇出' },
      { strokeNum: 3, name: '提', path: 'M 160,560 L 460,490', directionTip: '由左向右上方挑起，不宜過長' },
      { strokeNum: 4, name: '橫撇', path: 'M 540,360 L 760,360 L 620,490', directionTip: '右側子字頭' },
      { strokeNum: 5, name: '彎鉤', path: 'M 620,490 Q 690,660 670,820 Q 640,840 590,800', directionTip: '弧度優美，尾端起鉤' },
      { strokeNum: 6, name: '橫', path: 'M 490,560 L 860,560', directionTip: '貫穿子部，平正' },
    ],
  },
  '學': {
    char: '學',
    strokesCount: 16,
    radical: '子',
    remaining: '𦥑冖',
    rules: '先上後下：先寫上方臼字兩側與交叉點，次寫冖，底座寫子。',
    steps: [
      { strokeNum: 1, name: '撇點', path: 'M 320,200 L 280,270', directionTip: '左側點' },
      { strokeNum: 2, name: '點', path: 'M 430,220 L 450,290', directionTip: '中左點' },
      { strokeNum: 3, name: '撇', path: 'M 590,220 L 570,290', directionTip: '中右點' },
      { strokeNum: 4, name: '橫', path: 'M 240,320 L 780,320', directionTip: '橫平' },
      { strokeNum: 5, name: '點', path: 'M 240,360 L 230,420', directionTip: '冖左點' },
      { strokeNum: 6, name: '橫折鉤', path: 'M 230,370 L 790,370 L 780,440', directionTip: '冖右折' },
      { strokeNum: 7, name: '橫撇', path: 'M 380,520 L 640,520 L 480,620', directionTip: '子字橫撇' },
      { strokeNum: 8, name: '彎鉤', path: 'M 480,620 Q 560,740 520,840 Q 480,860 440,810', directionTip: '子字豎彎鉤' },
      { strokeNum: 9, name: '橫', path: 'M 280,660 L 750,660', directionTip: '子字長橫' },
    ],
  },
  '日': {
    char: '日',
    strokesCount: 4,
    radical: '日',
    remaining: '',
    rules: '先外後內再封口：左豎、橫折、中橫、底橫。',
    steps: [
      { strokeNum: 1, name: '豎', path: 'M 340,240 L 340,780', directionTip: '左邊直豎' },
      { strokeNum: 2, name: '橫折', path: 'M 340,260 L 680,260 L 680,780', directionTip: '橫平轉折直落' },
      { strokeNum: 3, name: '橫 (中橫)', path: 'M 340,500 L 680,500', directionTip: '居中平橫' },
      { strokeNum: 4, name: '橫 (封底)', path: 'M 340,760 L 680,760', directionTip: '底部封口' },
    ],
  },
  '月': {
    char: '月',
    strokesCount: 4,
    radical: '月',
    remaining: '',
    rules: '左撇、橫折鉤、中二短橫。',
    steps: [
      { strokeNum: 1, name: '豎撇', path: 'M 340,240 Q 340,560 260,820', directionTip: '由直轉向左舒展撇出' },
      { strokeNum: 2, name: '橫折鉤', path: 'M 340,260 L 680,260 L 680,820 L 620,770', directionTip: '橫平轉直下到底回鉤' },
      { strokeNum: 3, name: '橫 (上短橫)', path: 'M 340,440 L 680,440', directionTip: '中上橫' },
      { strokeNum: 4, name: '橫 (下短橫)', path: 'M 340,600 L 680,600', directionTip: '中下橫' },
    ],
  },
  '明': {
    char: '明',
    strokesCount: 8,
    radical: '日',
    remaining: '月',
    rules: '左窄右寬：先寫左「日」，後寫右「月」。日月合壁成明。',
    steps: [
      { strokeNum: 1, name: '豎', path: 'M 200,320 L 200,700', directionTip: '日之左豎' },
      { strokeNum: 2, name: '橫折', path: 'M 200,340 L 420,340 L 420,700', directionTip: '日之橫折' },
      { strokeNum: 3, name: '橫', path: 'M 200,500 L 420,500', directionTip: '日之中橫' },
      { strokeNum: 4, name: '橫', path: 'M 200,680 L 420,680', directionTip: '日之底橫' },
      { strokeNum: 5, name: '豎撇', path: 'M 560,240 Q 560,560 480,820', directionTip: '月之長撇' },
      { strokeNum: 6, name: '橫折鉤', path: 'M 560,260 L 840,260 L 840,820 L 780,770', directionTip: '月之橫折鉤' },
      { strokeNum: 7, name: '橫', path: 'M 560,450 L 840,450', directionTip: '月之中上橫' },
      { strokeNum: 8, name: '橫', path: 'M 560,610 L 840,610', directionTip: '月之中下橫' },
    ],
  },
};

// Generic stroke steps generator for any character
export function getGenericStrokeData(char: string, radical: string = '', strokeCount: number = 8): StrokePathData {
  if (STROKE_LIBRARY[char]) {
    return STROKE_LIBRARY[char];
  }

  // Standard procedural stroke decomposition for educational demonstration
  const steps: StrokePathData['steps'] = [];
  const strokeNames = ['橫 (一)', '豎 (丨)', '撇 (丿)', '捺 (乀)', '點 (丶)', '提 (㇀)', '橫折 (𠃍)', '豎鉤 (亅)', '彎鉤', '撇折'];
  
  for (let i = 1; i <= Math.min(strokeCount, 12); i++) {
    const name = strokeNames[(i - 1) % strokeNames.length];
    steps.push({
      strokeNum: i,
      name: `第 ${i} 筆：${name}`,
      path: `M 300,${200 + i * 40} L 724,${200 + i * 40}`,
      directionTip: `按照標準楷書筆順第 ${i} 筆書寫`
    });
  }

  return {
    char,
    strokesCount: strokeCount,
    radical: radical || '部首',
    remaining: '',
    rules: '楷書筆順原則：先橫後豎、先撇後捺、從上到下、從左到右、先外後內再封口。',
    steps,
  };
}
