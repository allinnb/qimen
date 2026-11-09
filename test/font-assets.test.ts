import{describe,it,expect}from'vitest';import fs from'node:fs';import path from'node:path';
const root=path.resolve('public/fonts/wenkai-tc');
describe('DSH-FIX-05 font shards',()=>{
 it('provides 400 and 700 unicode ranges',()=>{const css=fs.readFileSync(path.join(root,'index.css'),'utf8');expect(css).toContain('font-weight:400');expect(css).toContain('font-weight:700');expect(css).toContain('unicode-range:')});
 it('removes the old incomplete subset',()=>{expect(fs.existsSync(path.resolve('public/fonts/LXGW-WenKai-TC.woff2'))).toBe(false)});
 it('provides multiple shards for both weights',()=>{const files=fs.readdirSync(root);expect(files.filter(x=>x.startsWith('regular-')&&x.endsWith('.woff2')).length).toBeGreaterThan(5);expect(files.filter(x=>x.startsWith('medium-')&&x.endsWith('.woff2')).length).toBeGreaterThan(5)});
});
