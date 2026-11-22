# GitHub Desktop 한국어 패치

Windows용 **GitHub Desktop 3.7.0**을 위한 비공식 한글화 패치입니다. 초보자를 위한 **사진 포함 20쪽 PDF 안내서**를 함께 제공합니다.

**패치 버전: v0.4.0 · 안내서: 검토용 초안 v0.1**

GitHub 공식 배포판이 아닙니다. 공식 앱 실행파일을 재배포하지 않으며, 설치된 원본을 읽어 별도 한글 실행본을 만듭니다.

## 다운로드

- [패치 ZIP 다운로드](https://github.com/iruri19/github-desktop-korean-patch/releases/latest)
- [처음사용자 안내서 PDF](GitHub_처음사용자_안내서.pdf)
- [함께 볼 YouTube 영상·재생목록](https://www.youtube.com/watch?v=r8jQ9hVA2qs&list=PL0lo9MOBetEFcp4SCWinBdpml9B2U25-f)

PDF에는 사용자가 제공한 실제 학습 화면을 담았습니다. 저장소·브랜치·커밋·게시·병합·복제의 의미와 설치/복원 방법을 설명합니다. 영상 링크는 참고용이며 영상 내용을 검증하거나 요약한 것은 아닙니다.

## 설치 방법

1. [공식 GitHub Desktop](https://desktop.github.com/) **3.7.0**과 [Node.js LTS](https://nodejs.org/)를 준비합니다. 이 패치는 Windows의 `%LOCALAPPDATA%\GitHubDesktop\app-3.7.0`에 설치된 지정 해시의 파일만 지원합니다. 최신 버전이 다르면 이 패치를 강제로 적용하지 마세요.
2. Releases의 패치 ZIP을 받고 **모두 압축 풀기**를 합니다. 쓰기 가능한 일반 폴더를 사용하세요.
3. `Create-Korean-Copy.cmd`를 실행합니다. 약 **641MB 이상**의 추가 공간이 필요합니다.
4. 생성된 `GitHubDesktop-Korean-3.7.0-v0.4` 폴더에서 `Start-Korean.cmd`를 실행합니다. 기존 Desktop 창은 작업을 마친 뒤 종료하세요.
5. 도움말 → **처음사용자 안내서 (PDF)** 또는 `처음사용자` 폴더의 PDF로 사용법을 확인합니다.

기본적으로 별도 사용자 설정 폴더를 사용하므로 GitHub 로그인과 기존 저장소 추가가 필요할 수 있습니다. 이전 v0.3의 표준 설정 폴더가 바로 옆에 있으면 이를 재사용합니다. 개인 설정·토큰·로그인 데이터는 배포 파일에 포함하지 않습니다.

고급 사용자는 다음과 같이 새 대상 폴더를 지정할 수 있습니다.

```powershell
.\Create-Korean-Copy.ps1 -Destination 'D:\Apps\GitHubDesktop-Korean-3.7.0-v0.4'
```

기존 대상에는 덮어쓰지 않습니다. 실행 정책이 차단하면 중단하며 정책을 자동 변경하지 않습니다.

## 이번 수정

- 실행 중 다시 만들어지는 메뉴에도 번역 적용: Push, Remove, 외부 편집기, 명령 프롬프트 등.
- 충돌 해결, 커밋, 작업 트리, 검사 결과, 인증·보안 안내 등 정적 UI 후보를 넓혀 번역 보강.
- 메뉴 동작, ID, 단축키, 활성/비활성 상태를 유지하며 표시 이름만 변경.
- 도움말 메뉴에 처음사용자 PDF 추가.
- 사용자 파일, 코드 비교, 커밋 메시지, 입력 값, 브랜치·저장소 이름 보존.

## 범위와 한계

GitHub Desktop UI를 대상으로 합니다. **브라우저의 github.com, Antigravity, README 내용, Git 원본 출력은 번역 대상이 아닙니다.** 공식 약관은 오역을 피하기 위해 원문을 유지하며 일부 동적 문장도 영어가 남을 수 있습니다. 전체 화면 100% 한글화를 보장하지 않습니다.

별도 한글 실행본의 자동 업데이트를 막아 패치가 덮어써지지 않게 합니다. 공식 원본의 업데이트와는 별개입니다. 새 Desktop 버전에는 별도 검증이 필요합니다.

## 원본으로 돌아가기

한글 실행본을 종료하고 기존 공식 GitHub Desktop 바로가기로 실행하면 됩니다. 복사본 자체를 원래 상태로 복원하려면 종료 후 복사본 폴더의 `Restore-Copy.ps1`을 실행하세요. 저장소와 사용자 설정을 삭제하지 않습니다.

## 문제 해결

- **node를 찾지 못함**: Node.js 설치 후 새 터미널에서 실행하세요.
- **원본 파일 검증 실패**: 지원 버전/해시가 다릅니다. 임의로 검사나 해시를 제거하지 마세요.
- **대상 폴더가 이미 있음**: 다른 `Destination`을 지정하세요.
- **영어 메뉴가 남음**: 공식 영어판이 아닌 새 한글 실행본인지 확인하고 앱을 완전히 다시 실행하세요.
- **PDF를 못 찾음**: ZIP을 폴더 구조 그대로 풀었는지, 실행본의 `처음사용자` 폴더가 있는지 확인하세요.

## 검증

원본 해시와 복원 백업, `renderer.js` 보존, 메뉴 label 외 원본 코드 보존, 문법 검사, 번역·템플릿·DOM·원본 튜토리얼 구성요소 검사, 동적 메뉴 재생성 검사를 수행합니다. 자세한 실행 결과는 `VALIDATION.md`를 확인하세요. 정적 후보 수는 실제 번역률이 아닙니다.

## 수정과 기여

`ko-*.json` 번역을 수정할 수 있습니다. 동적 메뉴는 `ko-menu.cjs`, 표시 텍스트는 `translate-text.cjs`와 `korean-ui.js`가 담당합니다. ZIP의 `처음사용자` 폴더에는 수정용 Markdown과 원본 사진을 함께 제공합니다.

프로젝트 코드와 자체 문서는 MIT 라이선스로 제공합니다. GitHub 상표와 화면 및 제3자 번역 데이터의 권리는 각 권리자에게 있습니다. 커뮤니티 번역 데이터의 MIT 고지는 [THIRD-PARTY-LICENSE.txt](THIRD-PARTY-LICENSE.txt)에 유지합니다.

버그 제보에는 개인 토큰·로그인 정보·비공개 코드가 보이지 않게 가린 화면과 앱 버전, 재현 순서를 적어주세요.

### 개발용 검사 실행

Node.js 기본 모듈만 필요한 검사:

```powershell
node test-translation.cjs
node test-community-templates.cjs
node test-menu.cjs
```

DOM 및 원본 TSX 검사는 개발 의존성과 공식 3.7.0 소스 맵이 필요합니다.

```powershell
npm install --prefix .tooling --no-save linkedom@0.18.15 typescript@5.9.3
node test-dom.cjs
node test-source-ui.cjs
```
