'use strict';
const assert = require('node:assert/strict');
const { translate, dictionary } = require('./translate-text.cjs');
const fixtures = [
  ['Start tutorial',{},'튜토리얼 시작'],
  ['This will create a repository on your local machine, and push it to your account ',{},'이 컴퓨터에 연습용 저장소를 만든 뒤 다음 GitHub 계정에 올립니다: '],
  ['. This repository will only be visible to you, and not visible publicly.',{},'. 이 저장소는 나에게만 보이는 비공개 저장소로 만들어집니다.'],
  ['There are no uncommitted changes in this repository. Here are some friendly suggestions for what to do next.',{},'이 저장소에는 아직 커밋하지 않은 변경 사항이 없습니다. 아래에서 다음 작업을 선택하세요.'],
  ['Open the repository page on GitHub in your browser',{},'브라우저에서 이 저장소의 GitHub 페이지 열기'],
  [' menu or ',{},' 메뉴 또는 '],
  ['0 changed files',{changes:true},'변경한 파일 0개'],
  ['1 changed file',{changes:true},'변경한 파일 1개'],
  ['1,200 changed files',{changes:true},'변경한 파일 1,200개'],
  ['Commit to ',{commit:true},'커밋 대상: '],
  ['Commit 2 files to ',{commit:true},'파일 2개 커밋 대상: '],
  ['Commit to feature/한글-branch',{commit:true},'feature/한글-branch에 커밋'],
  ['Last fetched ',{toolbar:true},'마지막 원격 확인: '],
  ['18 minutes ago',{toolbar:true},'18분 전'],
  ['an hour ago',{toolbar:true},'1시간 전'],
  ['just now',{toolbar:true},'방금'],
  ['Last fetched 18 minutes ago',{toolbar:true},'마지막 원격 확인: 18분 전'],
  ['Fetch upstream',{toolbar:true},'upstream 원격 변경 확인'],
  ['Commit to main',{},'Commit to main'],
  ['18 minutes ago',{},'18 minutes ago'],
  ['feature/MyRepository',{},'feature/MyRepository'],
  ['@iruri19',{},'@iruri19'],
  ['README.md',{},'README.md'],
  ['A branch allows you to work on different versions of a repository at one time. Create a\n                branch by going into the branch menu in the top bar and\n              clicking "New branch".',{tutorial:true},'브랜치는 같은 저장소에서 여러 버전의 작업을 나눠 진행하는 기능입니다. 상단 브랜치 메뉴에서 ‘새 브랜치’를 선택하세요.']
];
for (const [input, context, expected] of fixtures) assert.equal(translate(input,context),expected,input);
const localPath = 'C:\\Users\\iruri\\OneDrive\\문서\\GitHub\\desktop-tutorial';
const error = `The path '${localPath}' already exists. Please move it out of the way, or remove it, and then try again.`;
assert.ok(translate(error,{dialog:true}).includes(localPath));
assert.ok(translate(error,{dialog:true}).includes('이미 존재하는 폴더'));
assert.equal(translate(error),error);
// Every exact dictionary entry must round-trip through normalized whitespace.
for (const [input, expected] of Object.entries(dictionary)) assert.equal(translate(input).trim(),expected.trim(),input);
console.log(JSON.stringify({sourceBasedFixtures:fixtures.length+3,dictionaryEntries:Object.keys(dictionary).length,dynamicValuesPreserved:true,passed:true},null,2));
