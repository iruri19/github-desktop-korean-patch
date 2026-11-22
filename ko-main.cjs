'use strict';
// Only loaded by the separate Korean copy. Original application remains untouched.
const path = require('node:path');
const fs = require('node:fs');
const { app, autoUpdater } = require('electron');
const profileConfig = path.resolve(__dirname, '../../korean-profile.json');
let userData = path.resolve(__dirname, '../../korean-user-data');
if (fs.existsSync(profileConfig)) {
  const selected = JSON.parse(fs.readFileSync(profileConfig,'utf8')).userDataPath;
  const resolved = path.resolve(selected);
  if (path.basename(resolved) !== 'korean-user-data' || !path.basename(path.dirname(resolved)).startsWith('GitHubDesktop-Korean-')) {
    throw new Error('한국어 실행본 전용 설정 폴더만 사용할 수 있습니다.');
  }
  userData = resolved;
}
app.setPath('userData', userData);
// Never run the official Squirrel updater from the modified copy.
autoUpdater.setFeedURL = () => {};
autoUpdater.checkForUpdates = () => {};
autoUpdater.quitAndInstall = () => {};
require('./ko-menu.cjs').install(require('electron'));
require('./main.js');
