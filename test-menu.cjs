'use strict';
const assert=require('node:assert/strict');
const {install,translateLabel}=require('./ko-menu.cjs');
for(const [before,after] of [
 ['Push','올리기'],['&Push','올리기(&P)'],['Remove...','목록에서 제거...'],
 ['Open in external editor','외부 편집기에서 열기'],
 ['Open in Command Prompt','명령 프롬프트에서 열기'],
 ['Open in Antigravity IDE','Antigravity IDE에서 열기'],
 ['Open in GitHub Copilot','GitHub Copilot에서 열기'],
 ['New worktree...','새 작업 트리...'],
 ['main','main'],['TEST_BRANCH','TEST_BRANCH'],['C:/Projects/main','C:/Projects/main']
]) assert.equal(translateLabel(before),after);
class Menu { constructor(items=[]){this.items=items} append(item){this.items.push(item)} popup(){return 'opened'} static buildFromTemplate(items){return new Menu(items.map(item=>({...item,submenu:Array.isArray(item.submenu)?Menu.buildFromTemplate(item.submenu):item.submenu})))}}
class MenuItem { constructor(options){Object.assign(this,options)} }
let clicked=false;
const action=()=>{clicked=true};
install({Menu,MenuItem,shell:{openPath:()=>{}}});
for(let i=0;i<3;i++) {
 const menu=Menu.buildFromTemplate([{id:'Repository',label:'Repository',submenu:[{id:'Push',label:'Push',enabled:false,accelerator:'Ctrl+P',click:action},{id:'Editor',label:'Open in external editor'}]},{id:'Help',label:'Help',submenu:[]}]);
 const push=menu.items[0].submenu.items[0];
 assert.equal(push.id,'Push');assert.equal(push.label,'올리기');assert.equal(push.enabled,false);assert.equal(push.accelerator,'Ctrl+P');assert.equal(push.click,action);
 assert.equal(menu.items[1].submenu.items.filter(item=>item.id==='korean-beginner-guide').length,1);
 assert.equal(menu.items[0].submenu.items[1].label,'외부 편집기에서 열기');
 push.click();
}
const popup=new Menu([{label:'Resolve',click:action}]);
assert.equal(popup.popup(),'opened');assert.equal(popup.items[0].label,'충돌 해결');assert.equal(popup.items[0].click,action);
assert.equal(clicked,true);
console.log(JSON.stringify({dynamicMenuRebuilds:3,menuActionsAndIdsPreserved:true,contextMenuTranslated:true,beginnerGuideAdded:true,passed:true}));
