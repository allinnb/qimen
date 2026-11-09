import fs from'node:fs';import{createRequire}from'node:module';const require=createRequire(import.meta.url),OpenCC=require('opencc-js');
const cv=OpenCC.Converter({from:'cn',to:'t'});const root=new URL('../src/data/',import.meta.url);
const convert=x=>typeof x==='string'?cv(x):Array.isArray(x)?x.map(convert):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).map(([k,v])=>[cv(k),convert(v)])):x;
const copy=JSON.parse(fs.readFileSync(new URL('copy-zh.json',root),'utf8'));fs.writeFileSync(new URL('copy-zht.json',root),JSON.stringify(convert(copy),null,2)+'\n');
const rules=JSON.parse(fs.readFileSync(new URL('rules.json',root),'utf8'));const risks=rules.riskKeywords;fs.writeFileSync(new URL('risk-keywords-zht.json',root),JSON.stringify({crisis:[...new Set([...risks.crisis,...risks.crisis.map(cv)])],block:[...new Set([...risks.block,...risks.block.map(cv)])]},null,2)+'\n');
