'use strict';
const community = Object.fromEntries(Object.entries(require('./ko-community.json')).filter(([key,value])=>!/{{|}}/.test(key+value)));
const {translateTemplate}=require('./community-template-engine.cjs');
const normalize = text => text.replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/\s+/g,' ').trim();
const normalized = new Map();
for (const source of [community,require('./ko.json'),require('./ko-extra.json'),require('./ko-settings.json'),require('./ko-workflow.json'),require('./ko-expanded.json')]) {
  for (const [key,value] of Object.entries(source)) normalized.set(normalize(key),value);
}
const dictionary = Object.fromEntries(normalized);
function translate(text, context = {}) {
  if (context.dialog && /[\r\n]/.test(text)) return text.split(/(\r?\n)/).map(line => /[\r\n]/.test(line) ? line : translate(line,context)).join('');
  const key = normalize(text);
  if (!key) return text;
  const direct = normalized.get(key);
  if (direct) return text.match(/^\s*/)[0] + direct + text.match(/\s*$/)[0];
  let match;
  if (context.preferences) {
    if ((match=key.match(/^(\d[\d,]*) models$/))) return `모델 ${match[1]}개`;
    if ((match=key.match(/^(\d+(?:\.\d+)?)% quota used$/))) return `한도 ${match[1]}% 사용`;
    if ((match=key.match(/^(\d+(?:\.\d+)?) (seconds?|minutes?|hours?|days?|weeks?|months?|years?)$/))) return `${match[1]}${{second:'초',minute:'분',hour:'시간',day:'일',week:'주',month:'개월',year:'년'}[match[2].replace(/s$/,'')]}`;
  }
  if (context.commit && key === 'Commit to') return '커밋 대상: ';
  if (context.commit && (match = key.match(/^Commit (\d[\d,]*) files? to$/))) return `파일 ${match[1]}개 커밋 대상: `;
  if (context.changes && (match = key.match(/^(\d[\d,]*) changed files?$/))) return `변경한 파일 ${match[1]}개`;
  if (context.commit && (match = key.match(/^Commit to (.+)$/))) return `${match[1]}에 커밋`;
  if (context.commit && (match = key.match(/^Commit (\d[\d,]*) files? to (.+)$/))) return `${match[2]}에 파일 ${match[1]}개 커밋`;
  if (context.toolbar) {
    if ((match = key.match(/^(\d+) (second|minute|hour|day|week|month|year)s? ago$/))) {
      return `${match[1]}${{second:'초',minute:'분',hour:'시간',day:'일',week:'주',month:'개월',year:'년'}[match[2]]} 전`;
    }
    if ((match = key.match(/^an? (second|minute|hour|day|week|month|year) ago$/))) return `1${{second:'초',minute:'분',hour:'시간',day:'일',week:'주',month:'개월',year:'년'}[match[1]]} 전`;
    if (key === 'now' || key === 'just now' || key === 'less than a minute ago') return '방금';
    if ((match = key.match(/^(Fetch|Pull|Push|Force push) (.+)$/))) return `${match[2]} ${ {Fetch:'원격 변경 확인',Pull:'가져오기',Push:'올리기','Force push':'강제 올리기'}[match[1]] }`;
    if ((match = key.match(/^Last fetched (.+)$/))) return `마지막 원격 확인: ${translate(match[1],{toolbar:true})}`;
  }
  if (context.tutorial && /^A branch allows you to work on different versions of a repository at one time\. Create a branch by going into the branch menu in the top bar and clicking "New [Bb]ranch"\.$/.test(key)) return '브랜치는 같은 저장소에서 여러 버전의 작업을 나눠 진행하는 기능입니다. 상단 브랜치 메뉴에서 ‘새 브랜치’를 선택하세요.';
  if (context.dialog && (match = text.trim().match(/^The path '(.+)' already exists\. Please move it out of the way, or remove it, and then try again\.$/))) return `이미 존재하는 폴더입니다: '${match[1]}'. 기존 저장소라면 ‘기존 저장소 추가’로 여세요. 새로 만들려면 기존 폴더를 이동하거나 삭제한 뒤 다시 시도하세요.`;
  if (context.ui || context.dialog || context.preferences || context.toolbar || context.tutorial || context.changes || context.commit) return translateTemplate(text);
  return text;
}
module.exports = { translate, dictionary, normalize };
