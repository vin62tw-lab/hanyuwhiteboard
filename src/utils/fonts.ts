import { FontFamilyOption } from '../types';

export interface FontOptionItem {
  value: FontFamilyOption;
  label: string;
  description: string;
}

export const FONT_OPTIONS: FontOptionItem[] = [
  { value: 'kaishu', label: '標楷體', description: '教育部標準楷書字形' },
  { value: 'songti', label: '宋體/明體', description: '典雅宋體，橫細豎粗' },
  { value: 'heiti', label: '黑體', description: '清晰無襯線等線體' },
  { value: 'fangsong', label: '仿宋體', description: '秀麗仿宋清秀結構' },
  { value: 'calligraphy', label: '毛筆書法體', description: '傳統行楷水墨書法' },
];

/**
 * Returns CSS font-family string guaranteed to render cross-platform:
 * Windows, macOS, iOS, Android, Linux, ChromeOS.
 */
export const getFontFamilyStyle = (font: FontFamilyOption): string => {
  switch (font) {
    case 'kaishu':
      // LXGW WenKai TC is loaded via webfont, falls back to standard TW KaiTi / BiauKai / DFKai-SB
      return '"LXGW WenKai TC", "DFKai-SB", "BiauKai", "KaiTi", "TW-Kai", "STKaiti", serif';
    case 'songti':
      // Noto Serif TC / SC loaded via Google Fonts
      return '"Noto Serif TC", "Noto Serif SC", "Songti SC", "SimSun", "PMingLiU", serif';
    case 'heiti':
      // Noto Sans TC / SC loaded via Google Fonts
      return '"Noto Sans TC", "Noto Sans SC", "PingFang TC", "Microsoft JhengHei", "Heiti TC", system-ui, sans-serif';
    case 'fangsong':
      // FangSong / ZCOOL XiaoWei loaded via Google Fonts
      return '"FangSong", "STFangsong", "ZCOOL XiaoWei", "Noto Serif TC", serif';
    case 'calligraphy':
      // Ma Shan Zheng loaded via Google Fonts
      return '"Ma Shan Zheng", "Kaiti", cursive, serif';
    default:
      return '"LXGW WenKai TC", "DFKai-SB", "BiauKai", "KaiTi", serif';
  }
};
