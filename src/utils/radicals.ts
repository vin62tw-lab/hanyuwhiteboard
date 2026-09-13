// Radical decomposition and data for high frequency Chinese characters

export interface RadicalDecomposition {
  radical: string;
  radicalName: string;
  remaining: string;
  position: 'left' | 'right' | 'top' | 'bottom' | 'surround' | 'integrated';
  strokeCount: number;
}

// Registry of common characters with exact radical & remaining component breakdown
export const CHARACTER_RADICALS: Record<string, RadicalDecomposition> = {
  // Left-Right
  '語': { radical: '言', radicalName: '言字旁', remaining: '吾', position: 'left', strokeCount: 14 },
  '语': { radical: '讠', radicalName: '言字旁', remaining: '吾', position: 'left', strokeCount: 9 },
  '話': { radical: '言', radicalName: '言字旁', remaining: '舌', position: 'left', strokeCount: 13 },
  '话': { radical: '讠', radicalName: '言字旁', remaining: '舌', position: 'left', strokeCount: 8 },
  '說': { radical: '言', radicalName: '言字旁', remaining: '兌', position: 'left', strokeCount: 14 },
  '说': { radical: '讠', radicalName: '言字旁', remaining: '兑', position: 'left', strokeCount: 9 },
  '讀': { radical: '言', radicalName: '言字旁', remaining: '賣', position: 'left', strokeCount: 22 },
  '读': { radical: '讠', radicalName: '言字旁', remaining: '卖', position: 'left', strokeCount: 10 },
  '認': { radical: '言', radicalName: '言字旁', remaining: '忍', position: 'left', strokeCount: 14 },
  '认': { radical: '讠', radicalName: '言字旁', remaining: '忍', position: 'left', strokeCount: 4 },
  '識': { radical: '言', radicalName: '言字旁', remaining: '戠', position: 'left', strokeCount: 19 },
  '识': { radical: '讠', radicalName: '言字旁', remaining: '只', position: 'left', strokeCount: 7 },
  '課': { radical: '言', radicalName: '言字旁', remaining: '果', position: 'left', strokeCount: 15 },
  '课': { radical: '讠', radicalName: '言字旁', remaining: '果', position: 'left', strokeCount: 10 },
  '謝': { radical: '言', radicalName: '言字旁', remaining: '射', position: 'left', strokeCount: 17 },
  '谢': { radical: '讠', radicalName: '言字旁', remaining: '射', position: 'left', strokeCount: 12 },
  '請': { radical: '言', radicalName: '言字旁', remaining: '青', position: 'left', strokeCount: 15 },
  '请': { radical: '讠', radicalName: '言字旁', remaining: '青', position: 'left', strokeCount: 10 },

  // Water 氵
  '海': { radical: '氵', radicalName: '三點水', remaining: '每', position: 'left', strokeCount: 10 },
  '河': { radical: '氵', radicalName: '三點水', remaining: '可', position: 'left', strokeCount: 8 },
  '江': { radical: '氵', radicalName: '三點水', remaining: '工', position: 'left', strokeCount: 6 },
  '洗': { radical: '氵', radicalName: '三點水', remaining: '先', position: 'left', strokeCount: 9 },
  '溫': { radical: '氵', radicalName: '三點水', remaining: '𥁕', position: 'left', strokeCount: 12 },
  '温': { radical: '氵', radicalName: '三點水', remaining: '皿', position: 'left', strokeCount: 12 },
  '游': { radical: '氵', radicalName: '三點水', remaining: '斿', position: 'left', strokeCount: 12 },
  '清': { radical: '氵', radicalName: '三點水', remaining: '青', position: 'left', strokeCount: 11 },
  '漢': { radical: '氵', radicalName: '三點水', remaining: '𦰌', position: 'left', strokeCount: 14 },
  '汉': { radical: '氵', radicalName: '三點水', remaining: '又', position: 'left', strokeCount: 5 },
  '湖': { radical: '氵', radicalName: '三點水', remaining: '胡', position: 'left', strokeCount: 12 },

  // Person 亻
  '你': { radical: '亻', radicalName: '單人旁', remaining: '尔', position: 'left', strokeCount: 7 },
  '他': { radical: '亻', radicalName: '單人旁', remaining: '也', position: 'left', strokeCount: 5 },
  '們': { radical: '亻', radicalName: '單人旁', remaining: '門', position: 'left', strokeCount: 10 },
  '们': { radical: '亻', radicalName: '單人旁', remaining: '门', position: 'left', strokeCount: 5 },
  '休': { radical: '亻', radicalName: '單人旁', remaining: '木', position: 'left', strokeCount: 6 },
  '作': { radical: '亻', radicalName: '單人旁', remaining: '乍', position: 'left', strokeCount: 7 },
  '做': { radical: '亻', radicalName: '單人旁', remaining: '故', position: 'left', strokeCount: 11 },
  '住': { radical: '亻', radicalName: '單人旁', remaining: '主', position: 'left', strokeCount: 7 },
  '便': { radical: '亻', radicalName: '單人旁', remaining: '更', position: 'left', strokeCount: 9 },
  '件': { radical: '亻', radicalName: '單人旁', remaining: '牛', position: 'left', strokeCount: 6 },
  '傳': { radical: '亻', radicalName: '單人旁', remaining: '專', position: 'left', strokeCount: 13 },
  '传': { radical: '亻', radicalName: '單人旁', remaining: '专', position: 'left', strokeCount: 6 },

  // Female 女
  '好': { radical: '女', radicalName: '女子旁', remaining: '子', position: 'left', strokeCount: 6 },
  '她': { radical: '女', radicalName: '女子旁', remaining: '也', position: 'left', strokeCount: 6 },
  '媽': { radical: '女', radicalName: '女子旁', remaining: '馬', position: 'left', strokeCount: 13 },
  '妈': { radical: '女', radicalName: '女子旁', remaining: '马', position: 'left', strokeCount: 6 },
  '姐': { radical: '女', radicalName: '女子旁', remaining: '且', position: 'left', strokeCount: 8 },
  '妹': { radical: '女', radicalName: '女子旁', remaining: '未', position: 'left', strokeCount: 8 },

  // Wood 木
  '校': { radical: '木', radicalName: '木字旁', remaining: '交', position: 'left', strokeCount: 10 },
  '林': { radical: '木', radicalName: '木字旁', remaining: '木', position: 'left', strokeCount: 8 },
  '森': { radical: '木', radicalName: '木字頭', remaining: '林', position: 'top', strokeCount: 12 },
  '樹': { radical: '木', radicalName: '木字旁', remaining: '尌', position: 'left', strokeCount: 16 },
  '树': { radical: '木', radicalName: '木字旁', remaining: '对', position: 'left', strokeCount: 9 },
  '杯': { radical: '木', radicalName: '木字旁', remaining: '不', position: 'left', strokeCount: 8 },
  '桌': { radical: '木', radicalName: '木字底', remaining: '占', position: 'bottom', strokeCount: 10 },

  // Sun 日
  '時': { radical: '日', radicalName: '日字旁', remaining: '寺', position: 'left', strokeCount: 10 },
  '时': { radical: '日', radicalName: '日字旁', remaining: '寸', position: 'left', strokeCount: 7 },
  '明': { radical: '日', radicalName: '日字旁', remaining: '月', position: 'left', strokeCount: 8 },
  '早': { radical: '日', radicalName: '日字頭', remaining: '十', position: 'top', strokeCount: 6 },
  '晴': { radical: '日', radicalName: '日字旁', remaining: '青', position: 'left', strokeCount: 12 },

  // Mouth 口
  '吃': { radical: '口', radicalName: '口字旁', remaining: '乞', position: 'left', strokeCount: 6 },
  '喝': { radical: '口', radicalName: '口字旁', remaining: '曷', position: 'left', strokeCount: 12 },
  '唱': { radical: '口', radicalName: '口字旁', remaining: '昌', position: 'left', strokeCount: 11 },
  '叫': { radical: '口', radicalName: '口字旁', remaining: '丩', position: 'left', strokeCount: 5 },
  '嗎': { radical: '口', radicalName: '口字旁', remaining: '馬', position: 'left', strokeCount: 13 },
  '吗': { radical: '口', radicalName: '口字旁', remaining: '马', position: 'left', strokeCount: 6 },
  '呢': { radical: '口', radicalName: '口字旁', remaining: '尼', position: 'left', strokeCount: 8 },
  '吧': { radical: '口', radicalName: '口字旁', remaining: '巴', position: 'left', strokeCount: 7 },
  '聽': { radical: '耳', radicalName: '耳字旁', remaining: '𢛳', position: 'left', strokeCount: 22 },
  '听': { radical: '口', radicalName: '口字旁', remaining: '斤', position: 'left', strokeCount: 7 },

  // Hand 扌
  '打': { radical: '扌', radicalName: '提手旁', remaining: '丁', position: 'left', strokeCount: 5 },
  '找': { radical: '扌', radicalName: '提手旁', remaining: '戈', position: 'left', strokeCount: 7 },
  '提': { radical: '扌', radicalName: '提手旁', remaining: '是', position: 'left', strokeCount: 12 },
  '推': { radical: '扌', radicalName: '提手旁', remaining: '隹', position: 'left', strokeCount: 11 },
  '拿': { radical: '手', radicalName: '手字底', remaining: '合', position: 'bottom', strokeCount: 10 },

  // Heart 心 / 忄
  '想': { radical: '心', radicalName: '心字底', remaining: '相', position: 'bottom', strokeCount: 13 },
  '忙': { radical: '忄', radicalName: '豎心旁', remaining: '亡', position: 'left', strokeCount: 6 },
  '快': { radical: '忄', radicalName: '豎心旁', remaining: '夬', position: 'left', strokeCount: 7 },
  '慢': { radical: '忄', radicalName: '豎心旁', remaining: '曼', position: 'left', strokeCount: 14 },
  '愛': { radical: '心', radicalName: '心字中', remaining: '爫冖友', position: 'surround', strokeCount: 13 },
  '爱': { radical: '爫', radicalName: '爪字頭', remaining: '冖友', position: 'top', strokeCount: 10 },

  // Foot ⻊
  '跑': { radical: '⻊', radicalName: '足字旁', remaining: '包', position: 'left', strokeCount: 12 },
  '跳': { radical: '⻊', radicalName: '足字旁', remaining: '兆', position: 'left', strokeCount: 13 },
  '踢': { radical: '⻊', radicalName: '足字旁', remaining: '易', position: 'left', strokeCount: 15 },
  '跟': { radical: '⻊', radicalName: '足字旁', remaining: '艮', position: 'left', strokeCount: 13 },

  // Motion ⻌
  '這': { radical: '⻌', radicalName: '走之旁', remaining: '言', position: 'surround', strokeCount: 11 },
  '这': { radical: '辶', radicalName: '走之旁', remaining: '文', position: 'surround', strokeCount: 7 },
  '進': { radical: '⻌', radicalName: '走之旁', remaining: '隹', position: 'surround', strokeCount: 12 },
  '进': { radical: '辶', radicalName: '走之旁', remaining: '井', position: 'surround', strokeCount: 7 },
  '邊': { radical: '⻌', radicalName: '走之旁', remaining: '𦸴', position: 'surround', strokeCount: 19 },
  '边': { radical: '辶', radicalName: '走之旁', remaining: '力', position: 'surround', strokeCount: 5 },
  '道': { radical: '⻌', radicalName: '走之旁', remaining: '首', position: 'surround', strokeCount: 13 },
  '過': { radical: '⻌', radicalName: '走之旁', remaining: '咼', position: 'surround', strokeCount: 13 },
  '过': { radical: '辶', radicalName: '走之旁', remaining: '寸', position: 'surround', strokeCount: 6 },

  // Roof 宀
  '字': { radical: '宀', radicalName: '寶蓋頭', remaining: '子', position: 'top', strokeCount: 6 },
  '家': { radical: '宀', radicalName: '寶蓋頭', remaining: '豕', position: 'top', strokeCount: 10 },
  '安': { radical: '宀', radicalName: '寶蓋頭', remaining: '女', position: 'top', strokeCount: 6 },
  '室': { radical: '宀', radicalName: '寶蓋頭', remaining: '至', position: 'top', strokeCount: 9 },

  // Grass 艹
  '茶': { radical: '艹', radicalName: '草字頭', remaining: '余', position: 'top', strokeCount: 10 },
  '花': { radical: '艹', radicalName: '草字頭', remaining: '化', position: 'top', strokeCount: 8 },
  '草': { radical: '艹', radicalName: '草字頭', remaining: '早', position: 'top', strokeCount: 10 },
  '菜': { radical: '艹', radicalName: '草字頭', remaining: '采', position: 'top', strokeCount: 12 },

  // Enclosure 囗
  '國': { radical: '囗', radicalName: '大口框', remaining: '或', position: 'surround', strokeCount: 11 },
  '国': { radical: '囗', radicalName: '大口框', remaining: '玉', position: 'surround', strokeCount: 8 },
  '圖': { radical: '囗', radicalName: '大口框', remaining: '啚', position: 'surround', strokeCount: 14 },
  '图': { radical: '囗', radicalName: '大口框', remaining: '冬', position: 'surround', strokeCount: 8 },
  '園': { radical: '囗', radicalName: '大口框', remaining: '袁', position: 'surround', strokeCount: 13 },
  '园': { radical: '囗', radicalName: '大口框', remaining: '元', position: 'surround', strokeCount: 7 },

  // Door 門 / 门
  '問': { radical: '門', radicalName: '門字框', remaining: '口', position: 'surround', strokeCount: 11 },
  '问': { radical: '门', radicalName: '门字框', remaining: '口', position: 'surround', strokeCount: 6 },
  '間': { radical: '門', radicalName: '門字框', remaining: '日', position: 'surround', strokeCount: 12 },
  '间': { radical: '门', radicalName: '门字框', remaining: '日', position: 'surround', strokeCount: 7 },

  // Study 學
  '學': { radical: '子', radicalName: '子字底', remaining: '𦥑冖', position: 'bottom', strokeCount: 16 },
  '学': { radical: '子', radicalName: '子字底', remaining: '⺌冖', position: 'bottom', strokeCount: 8 },
  '習': { radical: '羽', radicalName: '羽字頭', remaining: '白', position: 'top', strokeCount: 11 },
  '习': { radical: '乙', radicalName: '乙字部', remaining: '提', position: 'integrated', strokeCount: 3 },
  '練': { radical: '糸', radicalName: '絞絲旁', remaining: '柬', position: 'left', strokeCount: 15 },
  '练': { radical: '纟', radicalName: '絞絲旁', remaining: '东', position: 'left', strokeCount: 8 },

  // Food 飠 / 饣
  '飯': { radical: '飠', radicalName: '食字旁', remaining: '反', position: 'left', strokeCount: 12 },
  '饭': { radical: '饣', radicalName: '食字旁', remaining: '反', position: 'left', strokeCount: 7 },
  '館': { radical: '飠', radicalName: '食字旁', remaining: '官', position: 'left', strokeCount: 16 },
  '馆': { radical: '饣', radicalName: '食字旁', remaining: '官', position: 'left', strokeCount: 11 },

  // Animals
  '貓': { radical: '豸', radicalName: '豸字旁', remaining: '苗', position: 'left', strokeCount: 16 },
  '猫': { radical: '犭', radicalName: '反犬旁', remaining: '苗', position: 'left', strokeCount: 11 },
  '狗': { radical: '犭', radicalName: '反犬旁', remaining: '句', position: 'left', strokeCount: 8 },
  '鳥': { radical: '鳥', radicalName: '鳥字部', remaining: '', position: 'integrated', strokeCount: 11 },
  '鸟': { radical: '鸟', radicalName: '鸟字部', remaining: '', position: 'integrated', strokeCount: 5 },
  '魚': { radical: '魚', radicalName: '魚字部', remaining: '', position: 'integrated', strokeCount: 11 },
  '鱼': { radical: '鱼', radicalName: '鱼字部', remaining: '', position: 'integrated', strokeCount: 8 },

  // Common verbs & adverbs
  '和': { radical: '口', radicalName: '口字部', remaining: '禾', position: 'right', strokeCount: 8 },
  '中': { radical: '丨', radicalName: '豎字部', remaining: '口', position: 'integrated', strokeCount: 4 },
  '文': { radical: '文', radicalName: '文字部', remaining: '', position: 'integrated', strokeCount: 4 },
  '華': { radical: '艹', radicalName: '草字頭', remaining: '𦾓', position: 'top', strokeCount: 12 },
  '臺': { radical: '至', radicalName: '至字頭', remaining: '吉', position: 'top', strokeCount: 14 },
  '台': { radical: '口', radicalName: '口字底', remaining: '厶', position: 'bottom', strokeCount: 5 },
  '灣': { radical: '氵', radicalName: '三點水', remaining: '彎', position: 'left', strokeCount: 25 },
  '湾': { radical: '氵', radicalName: '三點水', remaining: '弯', position: 'left', strokeCount: 12 },
  '板': { radical: '木', radicalName: '木字旁', remaining: '反', position: 'left', strokeCount: 8 },
  '白': { radical: '白', radicalName: '白字部', remaining: '', position: 'integrated', strokeCount: 5 },
};

// Common Chinese radical components catalog
export const COMMON_RADICALS_LIST = [
  '亻', '彳', '氵', '冫', '口', '囗', '女', '子', '宀', '广',
  '木', '日', '月', '火', '灬', '土', '金', '钅', '石', '田',
  '言', '讠', '心', '忄', '手', '扌', '足', '⻊', '走', '⻌',
  '辶', '門', '门', '食', '飠', '饣', '糸', '纟', '犭', '鳥',
  '鸟', '魚', '鱼', '目', '耳', '禾', '米', '竹', '艹', '衣', '衤'
];

// Determine radical for any character with heuristic fallback
export function getCharacterRadical(char: string): RadicalDecomposition {
  if (CHARACTER_RADICALS[char]) {
    return CHARACTER_RADICALS[char];
  }

  // Check if character contains any common radical symbol as substring or prefix
  for (const rad of COMMON_RADICALS_LIST) {
    if (char === rad) {
      return { radical: rad, radicalName: `${rad}部`, remaining: '', position: 'integrated', strokeCount: 4 };
    }
  }

  // Fallback default
  return {
    radical: char,
    radicalName: '單字部',
    remaining: '',
    position: 'integrated',
    strokeCount: 5
  };
}
