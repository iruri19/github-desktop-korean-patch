'use strict';
const assert=require('node:assert/strict');
const {translate}=require('./translate-text.cjs');
const {translateTemplate,ruleCount}=require('./community-template-engine.cjs');
assert.equal(translateTemplate('About My App'),'My App 정보');
assert.equal(translateTemplate('About My  App'),'My  App 정보');
assert.equal(translateTemplate('Version 3.7.0'),'버전 3.7.0');
assert.equal(translate('About My App'), 'About My App');
assert.equal(translate('About My App',{ui:true}), 'My App 정보');
const path='C:\\Users\\iruri\\my  project\\desktop-tutorial';
const error=`The path '${path}' already exists. Please move it out of the way, or remove it, and then try again.`;
assert.ok(translate(error,{dialog:true}).includes(path));
const sources=require('./community-templates.json');
let preserved=0;
for(const item of sources){
 const en=[...item.en.matchAll(/{{\s*([^}]+?)\s*}}/g)].map(m=>m[1]);
 const ko=[...item.ko.matchAll(/{{\s*([^}]+?)\s*}}/g)].map(m=>m[1]);
 if(en.slice().sort().join('|')!==ko.slice().sort().join('|')||!/[가-힣]/.test(item.ko))continue;
 const values=new Map(en.map(key=>[key,`VALUE_${key}_A  B_$` ]));
 const input=item.en.replace(/{{\s*([^}]+?)\s*}}/g,(_,key)=>values.get(key));
 const output=translateTemplate(input);
 if(output===input)continue;
 for(const value of values.values())assert.ok(output.includes(value),item.key+' dropped parameter');
 assert.ok(!/{{[^}]+}}/.test(output),item.key+' unresolved parameter');
 preserved++;
}
console.log(JSON.stringify({templateRules:ruleCount,testedTemplates:preserved,parametersPreserved:true,passed:true},null,2));
