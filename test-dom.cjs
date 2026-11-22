'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {parseHTML}=require('./.tooling/node_modules/linkedom');
const html=`<!doctype html><html><body><div id="desktop-app-container">
<div class="tutorial-panel-component"><p>It doesn’t look like you have a text editor installed. We can recommend <a>Visual Studio Code</a> or <a>Atom</a>, but feel free to use any.</p></div>
<dialog class="error tooltip-host" role="alertdialog"><h1>Error</h1><div class="dialog-content"><pre>Failed creating the tutorial repository.\n\nUnable to publish repository. Please check if you have an internet connection and try again.</pre></div></dialog>
<div id="preferences"><h3>Default branch name for new repositories</h3><p>GitHub’s default branch name is <code>main</code>. You may want to change it due to different workflows, or because your integrations still require the historical default branch name of <code>master</code>.</p><p>These preferences will <a>edit your global Git config file</a>.</p><p>Chat messages</p><p>Code completions</p><p>No Copilot models available.</p><p>If you are using GitHub Enterprise at work, sign in to it to get access to your repositories.</p><select><option>Configure custom editor...</option><option>Command Prompt</option></select><p>No other editors found. <a>Install Visual Studio Code?</a></p><p>Experience agent-driven development built natively on GitHub.</p><label>App location<input placeholder="path to github.exe" value="C:\\MyApp\\github.exe"></label></div>
<div class="CodeMirror"><pre>const Name = 'Error';</pre></div><textarea>Do not translate my text</textarea>
<div class="commit-button">Commit to <strong>New</strong></div>
</div></body></html>`;
const {document,window}=parseHTML(html);
const queue=[];
vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'korean-ui.js'),'utf8'),{document,window,require,Element:window.Element,Node:window.Node,NodeFilter:{SHOW_ELEMENT:1,SHOW_TEXT:4},MutationObserver:window.MutationObserver,requestAnimationFrame:fn=>queue.push(fn)});
assert.equal(document.querySelector('textarea').value,'Do not translate my text');
assert.equal(document.querySelector('.CodeMirror pre').textContent,"const Name = 'Error';");
assert.equal(document.querySelector('.commit-button strong').textContent,'New');
assert.equal(document.querySelector('input').value,'C:\\MyApp\\github.exe');
assert.ok(!/[A-Za-z]{4,}/.test(document.querySelector('dialog pre').textContent.replace(/GitHub/g,'')));
assert.ok(document.querySelector('#preferences').textContent.includes('새 저장소의 기본 브랜치 이름'));
assert.ok(document.querySelector('#preferences').textContent.includes('사용 가능한 Copilot 모델이 없습니다.'));
assert.ok(!document.querySelector('#preferences').textContent.includes('Default branch name'));
assert.ok(!document.querySelector('.tutorial-panel-component').textContent.includes('We can recommend'));
assert.equal(document.querySelector('input').getAttribute('placeholder'),'github.exe 경로');
console.log(JSON.stringify({tutorial:document.querySelector('.tutorial-panel-component').textContent,error:document.querySelector('dialog pre').textContent,preferences:document.querySelector('#preferences').textContent,commit:document.querySelector('.commit-button').textContent,sourceAndInputsPreserved:true},null,2));
