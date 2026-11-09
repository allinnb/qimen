import{describe,it,expect}from'vitest';import{dailyMotto,beijingDateKey,toHant}from'../src/presentation';

describe('DSH-FIX-04 今日箴言與繁體顯示',()=>{
 it('同一天多次取值一致',()=>{const a=dailyMotto(new Date('2026-11-09T00:01:00Z'));const b=dailyMotto(new Date('2026-11-09T15:59:00Z'));expect(a).toEqual(b)});
 it('跨日會按日期重新選取',()=>{const a=dailyMotto(new Date('2026-11-09T15:59:00Z'));const b=dailyMotto(new Date('2026-11-09T16:01:00Z'));expect(a.dateKey).not.toBe(b.dateKey);expect(a).not.toEqual(b)});
 it('今日門等於北京時間當天12時盤的值使門',()=>{const now=new Date('2026-11-09T03:20:00Z'),m=dailyMotto(now);expect(m.door).toBe('死門');expect(m.dateKey).toBe('2026-11-09')});
 it('北京日期鍵不受本機時區影響',()=>{expect(beijingDateKey(new Date('2026-11-09T16:01:00Z'))).toBe('2026-11-10')});
 it('引擎詞彙轉為繁體顯示',()=>{expect(toHant('阳遁 天冲 开门 东南 空 刑 墓 迫 惊蛰 谷雨')).toBe('陽遁 天衝 開門 東南 空 刑 墓 迫 驚蟄 穀雨')});
 it('繁體危機詞仍能觸發攔截',async()=>{const{judge,chartAt}=await import('../src/engine');expect(judge('job','我不想活',chartAt(new Date('2026-11-09T03:20:00Z'))).crisis).toBe(true)});
});
