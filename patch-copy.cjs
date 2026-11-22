'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const cp = require('node:child_process');
const root = __dirname;
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
manifest.installationRoot = manifest.installationRoot.replace('%LOCALAPPDATA%', process.env.LOCALAPPDATA);
const { dictionary } = require('./translate-text.cjs');
const digest = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const protectedRoot = fs.realpathSync(manifest.installationRoot).toLowerCase();
function assertCopy(appRoot) {
  const real = fs.realpathSync(appRoot).toLowerCase();
  if (real === protectedRoot || real.startsWith(protectedRoot + path.sep)) throw new Error('설치된 원본 경로에는 패치를 적용할 수 없습니다.');
  const resources = path.join(appRoot, 'resources', 'app');
  if (JSON.parse(fs.readFileSync(path.join(resources, 'package.json'), 'utf8')).version !== manifest.version) throw new Error('지원 버전은 3.7.0입니다.');
  for (const [name, expected] of Object.entries(manifest.sourceHashes)) {
    if (digest(path.join(resources, name)) !== expected) throw new Error(`원본 파일 검증 실패: ${name}. 수정되지 않은 3.7.0 복사본만 지원합니다.`);
  }
  return resources;
}
function patch(appRoot) {
  const resources = assertCopy(appRoot);
  let main = fs.readFileSync(path.join(resources, 'main.js'), 'utf8');
  let menuLabels = 0;
  main = main.replace(/label:"((?:\\.|[^"\\])*)"/g, (whole, escaped) => {
    let text;
    try { text = JSON.parse(`"${escaped}"`); } catch { return whole; }
    const normalized = text.replace(/&/g, '');
    let translated = dictionary[normalized];
    if (!translated) {
      const key = Object.keys(dictionary).find(key => key.toLowerCase() === normalized.toLowerCase());
      if (key) translated = dictionary[key];
    }
    if (!translated) return whole;
    const accessKey = text.match(/&(.)/);
    if (accessKey) translated += `(&${accessKey[1].toUpperCase()})`;
    menuLabels++;
    return 'label:' + JSON.stringify(translated);
  });
  if (menuLabels < 25) throw new Error(`메뉴 구조가 예상과 다릅니다: ${menuLabels}개. 적용 중단.`);
  let html = fs.readFileSync(path.join(resources, 'index.html'), 'utf8');
  if (!html.includes('<script defer src=renderer.js></script>')) throw new Error('시작 화면 구조가 예상과 다릅니다. 적용 중단.');
  html = html.replace('<script defer src=renderer.js></script>', '<script defer src=renderer.js></script><script defer src=korean-ui.js></script>');
  const pkg = JSON.parse(fs.readFileSync(path.join(resources, 'package.json'), 'utf8'));
  pkg.main = './ko-main.cjs';
  // Restore files belong only to the copy. No install or registry operations.
  const backup = path.join(appRoot, 'korean-original-files');
  fs.mkdirSync(backup,{recursive:true});
  for (const name of ['main.js','index.html','package.json']) {
    const original=path.join(backup,name);
    if (fs.existsSync(original)) {
      if (digest(original)!==manifest.sourceHashes[name]) throw new Error(`복원용 백업 검증 실패: ${name}`);
    } else fs.copyFileSync(path.join(resources,name),original);
  }
  fs.writeFileSync(path.join(resources,'main.js'), main, 'utf8');
  fs.writeFileSync(path.join(resources,'index.html'), html, 'utf8');
  fs.writeFileSync(path.join(resources,'package.json'), JSON.stringify(pkg,null,2), 'utf8');
  for (const name of ['korean-ui.js','ko-main.cjs','ko-menu.cjs','ko.json','ko-extra.json','ko-settings.json','ko-workflow.json','ko-expanded.json','ko-community.json','community-templates.json','community-template-engine.cjs','translate-text.cjs']) fs.copyFileSync(path.join(root,name),path.join(resources,name));
  fs.copyFileSync(path.join(root,'THIRD-PARTY-LICENSE.txt'),path.join(appRoot,'THIRD-PARTY-LICENSE.txt'));
  for (const name of ['main.js','renderer.js','korean-ui.js','ko-main.cjs','ko-menu.cjs','translate-text.cjs','community-template-engine.cjs']) {
    cp.execFileSync(process.execPath,['--check',path.join(resources,name)],{stdio:'pipe'});
  }
  const guideSource = path.join(root, '처음사용자');
  if (fs.existsSync(guideSource)) fs.cpSync(guideSource,path.join(appRoot,'처음사용자'),{recursive:true});
  else if (fs.existsSync(path.join(root,'GitHub_처음사용자_안내서.pdf'))) {
    const guideTarget=path.join(appRoot,'처음사용자');
    fs.mkdirSync(guideTarget,{recursive:true});
    fs.copyFileSync(path.join(root,'GitHub_처음사용자_안내서.pdf'),path.join(guideTarget,'GitHub_처음사용자_안내서.pdf'));
  }
  const report = { version:manifest.version,menuLabels,dictionaryEntries:Object.keys(dictionary).length,templateRules:require('./community-template-engine.cjs').ruleCount,sourceRendererUnchanged:digest(path.join(resources,'renderer.js'))===manifest.sourceHashes['renderer.js'] };
  fs.writeFileSync(path.join(appRoot,'korean-patch-report.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
}
const target = process.argv[2];
if (!target) throw new Error('별도 복사본 경로가 필요합니다. Create-Korean-Copy.ps1을 사용하세요.');
patch(path.resolve(target));
