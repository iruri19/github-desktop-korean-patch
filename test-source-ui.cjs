'use strict';
// Render actual bundled TSX sources into an in-memory DOM. No native app or screen capture.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ts=require('./.tooling/node_modules/typescript');
const {parseHTML}=require('./.tooling/node_modules/linkedom');
const map=JSON.parse(fs.readFileSync(require('node:path').join(process.env.LOCALAPPDATA,'GitHubDesktop/app-3.7.0/resources/app/renderer.js.map'),'utf8'));
const Fragment=Symbol('Fragment');
class Component{constructor(props){this.props=props;this.state={};}setState(value){this.state={...this.state,...value};}}
const React={Component,Fragment,createRef:()=>({current:null}),createElement:(type,props,...children)=>({type,props:{...props,children}})};
function named(name){return props=>({type:name,props});}
const step={PickEditor:0,CreateBranch:1,EditFile:2,MakeCommit:3,PushBranch:4,OpenPullRequest:5};
function dependency(id){
 if(id==='react')return React;
 return new Proxy({
  Dialog:props=>React.createElement('dialog',{id:props.id,role:'dialog'},React.createElement('h1',{},props.title),...props.children),
  DialogContent:named('section'),DialogFooter:named('footer'),Ref:named('code'),LinkButton:named('a'),Button:named('button'),
  OkCancelButtonGroup:props=>React.createElement('footer',{},React.createElement('button',{},props.okButtonText||'OK'),React.createElement('button',{},'Cancel')),
  TutorialStepInstructions:props=>React.createElement('section',{},React.createElement('h2',{},props.summaryText),...props.children),
  SuggestedAction:props=>React.createElement('section',{},React.createElement('h2',{},props.title),React.createElement('p',{},props.description),React.createElement('button',{},props.buttonText)),
  SuggestedActionGroup:named('section'),Octicon:()=>null,KeyboardShortcut:()=>null,
  encodePathAsUrl:()=>'',getHTMLURL:()=> 'https://github.com',
  suggestedExternalEditor:{name:'Visual Studio Code',url:'https://code.visualstudio.com'},
  TutorialStep:step,orderedTutorialSteps:Object.values(step)
 },{get:(target,key)=>key in target?target[key]:{}});
}
function sourceClass(suffix,name){
 const index=map.sources.findIndex(file=>file.endsWith(suffix));assert.ok(index>=0,suffix);
 const source=map.sourcesContent[index];
 const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React}}).outputText;
 const exports={};vm.runInNewContext(js,{exports,require:dependency,__dirname:'.',setTimeout:()=>{},__DARWIN__:false,log:{error:()=>{}}});
 return exports[name];
}
const {document,window}=parseHTML('<!doctype html><html><body></body></html>');
function mount(tree,parent){
 if(tree===null||tree===undefined||tree===false)return;
 if(Array.isArray(tree)){tree.forEach(child=>mount(child,parent));return;}
 if(typeof tree==='string'||typeof tree==='number'){parent.appendChild(document.createTextNode(String(tree)));return;}
 if(tree.type===Fragment){mount(tree.props.children,parent);return;}
 if(typeof tree.type==='function'){
  const rendered=tree.type.prototype?.render?new tree.type(tree.props).render():tree.type(tree.props);
  mount(rendered,parent);return;
 }
 if(typeof tree.type!=='string')return;
 const element=document.createElement(tree.type);
 for(const [key,value]of Object.entries(tree.props||{})){
  if(key==='className')element.setAttribute('class',value);
  else if(['id','role','placeholder'].includes(key)&&value)element.setAttribute(key,value);
 }
 parent.appendChild(element);mount(tree.props?.children,element);
}
const cases=[
 ['/ui/no-repositories/create-tutorial-repository-dialog.tsx','CreateTutorialRepositoryDialog',{account:{login:'iruri19',endpoint:'https://api.github.com',friendlyEndpoint:'GitHub.com'}}],
 ['/ui/tutorial/welcome.tsx','TutorialWelcome',{}],
 ['/ui/tutorial/tutorial-panel.tsx','TutorialPanel',{currentTutorialStep:0,resolvedExternalEditor:null,repository:{path:'C:/sample'}}],
 ['/ui/tutorial/done.tsx','TutorialDone',{repository:{}}],
 ['/ui/tutorial/confirm-exit-tutorial.tsx','ConfirmExitTutorial',{}]
];
for(const [file,name,props]of cases){const Cls=sourceClass(file,name);mount(new Cls(props).render(),document.body);}
vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'korean-ui.js'),'utf8'),{document,window,require,Element:window.Element,Node:window.Node,NodeFilter:{SHOW_ELEMENT:1,SHOW_TEXT:4},MutationObserver:window.MutationObserver,requestAnimationFrame:()=>{}});
const text=document.body.textContent;
for(const fragment of ['This will create a repository','It doesn’t look like','file, save it','A commit allows','Publishing will','A pull request allows','Are you sure you want','You’ve learned','A branch allows'])assert.ok(!text.includes(fragment),`실제 소스 미번역: ${fragment}`);
assert.ok(text.includes('@iruri19'));assert.ok(text.includes('README.md'));
assert.ok(text.includes('브랜치는 같은 저장소에서 여러 버전'));
console.log(JSON.stringify({actualSourceComponents:cases.length,tutorialDescriptionsTranslated:true,accountAndFilenamePreserved:true,passed:true},null,2));
