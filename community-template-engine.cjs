'use strict';
const source = require('./community-templates.json');
const placeholders = text => [...text.matchAll(/{{\s*([^}]+?)\s*}}/g)].map(m=>m[1]);
const escape = text => text.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const rules = [];
for (const item of source) {
  const enNames=placeholders(item.en),koNames=placeholders(item.ko);
  if (!/[가-힣]/.test(item.ko) || enNames.slice().sort().join('|')!==koNames.slice().sort().join('|')) continue;
  const english=item.en.trim();
  // Adjacent variables cannot be recovered safely from already-rendered text.
  if (/}}\s*{{/.test(english)) continue;
  let cursor=0,pattern='^';
  const names=[];
  for(const match of english.matchAll(/{{\s*([^}]+?)\s*}}/g)) {
    pattern+=escape(english.slice(cursor,match.index)).replace(/\s+/g,'\\s+')+'([\\s\\S]+?)';
    names.push(match[1]);cursor=match.index+match[0].length;
  }
  pattern+=escape(english.slice(cursor)).replace(/\s+/g,'\\s+')+'$';
  // A template that is only a variable must never translate arbitrary user data.
  if (!/[A-Za-z]{2}/.test(english.replace(/{{[^}]+}}/g,''))) continue;
  rules.push({regex:new RegExp(pattern),names,korean:item.ko,weight:english.replace(/{{[^}]+}}/g,'').length});
}
rules.sort((a,b)=>b.weight-a.weight);
function translateTemplate(text) {
 for (const rule of rules) {
  const match=text.trim().match(rule.regex);if(!match)continue;
  const values=new Map();let valid=true;
  rule.names.forEach((name,i)=>{if(values.has(name)&&values.get(name)!==match[i+1])valid=false;values.set(name,match[i+1]);});
  if(!valid)continue;
  const result=rule.korean.replace(/{{\s*([^}]+?)\s*}}/g,(_,key)=>values.get(key));
  return text.match(/^\s*/)[0]+result+text.match(/\s*$/)[0];
 }
 return text;
}
module.exports={translateTemplate,ruleCount:rules.length};
