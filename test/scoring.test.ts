import{describe,it,expect}from'vitest';import{Solar}from'lunar-javascript';import{chartAt,judge,canAskAgain}from'../src/engine';
describe('DSH-FIX-02 scoring',()=>{
 it('立冬后 11-09 月令为亥',()=>{expect(Solar.fromYmdHms(2026,11,9,11,20,0).getLunar().getMonthZhiExact()).toBe('亥')});
 it('值符天禽能找到 extraStar 辅用神',()=>{const c=chartAt(new Date('2026-11-09T03:20:00Z'));expect(c.zhiFu).toBe('天禽');expect(judge('job','',c).secondary?.extraStar).toBe('天禽')});
 it('输出与日干宫关系分',()=>{const o=judge('money','',chartAt(new Date('2026-11-09T03:20:00Z')));expect(o.reasons.some(x=>x.label.startsWith('日干关系'))).toBe(true)});
 it('感情输出乙庚关系分',()=>{const o=judge('love','',chartAt(new Date('2026-11-09T03:20:00Z')));expect(o.reasons.some(x=>x.label.startsWith('乙庚'))).toBe(true)});
 it('24小时内同类不能重复问',()=>{const now=Date.now();expect(canAskAgain([{type:'job',time:now-1000}],'job',now)).toBe(false);expect(canAskAgain([{type:'job',time:now-25*3600000}],'job',now)).toBe(true)});
});
