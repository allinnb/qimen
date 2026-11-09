// 时家奇门 · 转盘 · 拆补法  参考实现（Hark 2026-11-09）
// 依赖：lunar-javascript（节气精确交节时刻、日干支）
// 约定：输入为北京时间（UTC+8）的年月日时分；23:00 起换日（可配 ziHourSplit=0）
import { Solar } from 'lunar-javascript';

export const GAN = '甲乙丙丁戊己庚辛壬癸'.split('');
export const ZHI = '子丑寅卯辰巳午未申酉戌亥'.split('');
const STEM_ORDER = ['戊', '己', '庚', '辛', '壬', '癸', '丁', '丙', '乙'];
const XUN_YI: Record<string, string> = { 子: '戊', 戌: '己', 申: '庚', 午: '辛', 辰: '壬', 寅: '癸' }; // 旬首地支 -> 遁仪
const RING = [1, 8, 3, 4, 9, 2, 7, 6]; // 外八宫顺时针
const STAR_HOME: Record<number, string> = { 1: '天蓬', 2: '天芮', 3: '天冲', 4: '天辅', 5: '天禽', 6: '天心', 7: '天柱', 8: '天任', 9: '天英' };
const DOOR_HOME: Record<number, string> = { 1: '休门', 2: '死门', 3: '伤门', 4: '杜门', 6: '开门', 7: '惊门', 8: '生门', 9: '景门' };
const GODS = ['值符', '螣蛇', '太阴', '六合', '白虎', '玄武', '九地', '九天'];
const DIR: Record<number, string> = { 1: '北', 8: '东北', 3: '东', 4: '东南', 9: '南', 2: '西南', 7: '西', 6: '西北' };
const BRANCH_GONG: Record<string, number> = { 子: 1, 丑: 8, 寅: 8, 卯: 3, 辰: 4, 巳: 4, 午: 9, 未: 2, 申: 2, 酉: 7, 戌: 6, 亥: 6 };
const JU: Record<string, [number, number, number]> = {
  冬至: [1, 7, 4], 惊蛰: [1, 7, 4], 小寒: [2, 8, 5], 大寒: [3, 9, 6], 春分: [3, 9, 6], 立春: [8, 5, 2], 雨水: [9, 6, 3],
  清明: [4, 1, 7], 立夏: [4, 1, 7], 谷雨: [5, 2, 8], 小满: [5, 2, 8], 芒种: [6, 3, 9],
  夏至: [9, 3, 6], 白露: [9, 3, 6], 小暑: [8, 2, 5], 大暑: [7, 1, 4], 秋分: [7, 1, 4], 立秋: [2, 5, 8], 处暑: [1, 4, 7],
  寒露: [6, 9, 3], 立冬: [6, 9, 3], 霜降: [5, 8, 2], 小雪: [5, 8, 2], 大雪: [4, 7, 1],
};
const YANG_TERMS = ['冬至', '小寒', '大寒', '立春', '雨水', '惊蛰', '春分', '清明', '谷雨', '立夏', '小满', '芒种'];
const JIXING: Record<string, number> = { 戊: 3, 己: 2, 庚: 8, 辛: 9, 壬: 4, 癸: 4 };
const RUMU: Record<string, number> = { 乙: 2, 丙: 6, 丁: 8 }; // 待二次核对

export type Palace = {
  gong: number; dir: string; earthStem: string; earthStemJi?: string; heavenStem: string; heavenStemJi?: string;
  star: string; extraStar?: string; door: string; god: string;
  flags: { kong?: boolean; jixing?: boolean; rumu?: boolean; menpo?: boolean };
};
export type Chart = {
  time: string; solarTerm: string; yinYang: '阳' | '阴'; yuan: '上' | '中' | '下'; ju: number;
  dayGZ: string; hourGZ: string; xunShou: string; zhiFu: string; zhiShi: string; kong: string[]; palaces: Palace[];
};

const gzIndex = (gz: string) => { for (let i = 0; i < 60; i++) if (GAN[i % 10] + ZHI[i % 12] === gz) return i; throw new Error(gz); };
const gzOf = (i: number) => GAN[((i % 60) + 60) % 10] + ZHI[((i % 60) + 60) % 12];
const ringPos = (g: number) => RING.indexOf(g === 5 ? 2 : g);
const WX_G: Record<number, string> = { 1: '水', 2: '土', 3: '木', 4: '木', 6: '金', 7: '金', 8: '土', 9: '火' };
const WX_D: Record<string, string> = { 休门: '水', 生门: '土', 伤门: '木', 杜门: '木', 景门: '火', 死门: '土', 惊门: '金', 开门: '金' };
const KE: Record<string, string> = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };

export function chartAt(y: number, m: number, d: number, hh: number, mi: number, opts: { ziHourSplit?: 23 | 0 } = {}): Chart {
  const split = opts.ziHourSplit ?? 23;
  const solar = Solar.fromYmdHms(y, m, d, hh, mi, 0);
  const lunar = solar.getLunar();
  // 日干支（23 点换日）
  let dayIdx = gzIndex(lunar.getDayInGanZhi());
  if (split === 23 && hh >= 23) dayIdx += 1;
  const dayGZ = gzOf(dayIdx);
  // 时干支（五鼠遁）
  const hz = Math.floor(((hh + 1) % 24) / 2);
  const hourGan = ((dayIdx % 10) % 5) * 2 % 10; // 甲己日起甲子时
  const hourIdxIn60 = (() => { const g = (hourGan + hz) % 10; for (let i = 0; i < 60; i++) if (i % 10 === g && i % 12 === hz) return i; return 0; })();
  const hourGZ = gzOf(hourIdxIn60);
  // 节气（精确交节时刻）
  const jq = lunar.getPrevJieQi(false);
  const term: string = jq.getName();
  const yinYang: '阳' | '阴' = YANG_TERMS.includes(term) ? '阳' : '阴';
  // 符头：最近的甲或己日
  const futou = gzOf(dayIdx - (dayIdx % 5));
  const fz = futou[1];
  const yuan: '上' | '中' | '下' = '子午卯酉'.includes(fz) ? '上' : '寅申巳亥'.includes(fz) ? '中' : '下';
  const ju = JU[term][yuan === '上' ? 0 : yuan === '中' ? 1 : 2];
  // 地盘
  const earth: Record<number, string> = {};
  for (let k = 0; k < 9; k++) {
    const g = yinYang === '阳' ? ((ju - 1 + k) % 9) + 1 : ((ju - 1 - k + 90) % 9) + 1;
    earth[g] = STEM_ORDER[k];
  }
  const stemGong = (s: string) => Number(Object.keys(earth).find((g) => earth[+g] === s));
  // 旬首
  const xunIdx = hourIdxIn60 - (hourIdxIn60 % 10);
  const xunShou = gzOf(xunIdx);
  const yi = XUN_YI[xunShou[1]];
  const xunGong = stemGong(yi);
  const zhiFu = STAR_HOME[xunGong];
  const zhiShi = xunGong === 5 ? '死门' : DOOR_HOME[xunGong];
  // 天盘：值符星到时干宫
  const hGan = hourGZ[0];
  let target = hGan === '甲' ? xunGong : stemGong(hGan);
  if (target === 5) target = 2;
  const fromStarGong = xunGong === 5 ? 2 : xunGong;
  const starShift = ringPos(target) - ringPos(fromStarGong);
  const palaces: Record<number, Palace> = {};
  for (const g of RING) palaces[g] = { gong: g, dir: DIR[g], earthStem: earth[g], heavenStem: '', star: '', door: '', god: '', flags: {} };
  palaces[2].earthStemJi = earth[5];
  for (const home of RING) {
    const to = RING[(ringPos(home) + starShift + 8) % 8];
    palaces[to].star = STAR_HOME[home];
    palaces[to].heavenStem = earth[home];
    if (home === 2) { palaces[to].extraStar = '天禽'; palaces[to].heavenStemJi = earth[5]; }
  }
  // 人盘：值使
  const n = (hourIdxIn60 % 12 - xunIdx % 12 + 12) % 12;
  let shiGong = xunGong;
  for (let i = 0; i < n; i++) shiGong = yinYang === '阳' ? (shiGong % 9) + 1 : ((shiGong + 7) % 9) + 1;
  if (shiGong === 5) shiGong = 2;
  const doorHomeGong = Number(Object.keys(DOOR_HOME).find((g) => DOOR_HOME[+g] === zhiShi));
  const doorShift = ringPos(shiGong) - ringPos(doorHomeGong);
  for (const home of RING) palaces[RING[(ringPos(home) + doorShift + 8) % 8]].door = DOOR_HOME[home];
  // 神盘
  const fuPos = ringPos(target);
  GODS.forEach((god, i) => { palaces[RING[(fuPos + (yinYang === '阳' ? i : -i) + 16) % 8]].god = god; });
  // 空亡
  const kz = [ZHI[(xunIdx + 10) % 12], ZHI[(xunIdx + 11) % 12]];
  const kongGong = new Set(kz.map((z) => BRANCH_GONG[z]));
  for (const g of RING) {
    const p = palaces[g];
    if (kongGong.has(g)) p.flags.kong = true;
    const stems = [p.heavenStem, p.heavenStemJi].filter(Boolean) as string[];
    if (stems.some((s) => JIXING[s] === g)) p.flags.jixing = true;
    if (stems.some((s) => RUMU[s] === g)) p.flags.rumu = true;
    if (KE[WX_D[p.door]] === WX_G[g]) p.flags.menpo = true;
  }
  return {
    time: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')} ${String(hh).padStart(2, '0')}:${String(mi).padStart(2, '0')}`,
    solarTerm: term, yinYang, yuan, ju, dayGZ, hourGZ, xunShou: xunShou + yi, zhiFu, zhiShi, kong: kz,
    palaces: RING.map((g) => palaces[g]),
  };
}
