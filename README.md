# 개발 공유 트리

HTML 설명자료를 폴더에 넣기만 하면 트리로 자동 정리되고 URL로 공유되는 저장소입니다.
목차를 손으로 짜거나 빌드 명령을 칠 필요가 없습니다.

---

## 최초 1회 세팅 (5분)

1. 이 폴더를 GitHub 저장소로 push
   ```bash
   git init && git add . && git commit -m "init"
   git branch -M main
   git remote add origin <저장소-URL>
   git push -u origin main
   ```
2. GitHub 저장소 → **Settings → Pages → Source** 를 **GitHub Actions** 로 설정
3. 끝. 잠시 뒤 `https://<계정>.github.io/<저장소>/` 로 트리가 열립니다.

> 사내 GitLab이라면 `.github/workflows/build-tree.yml` 대신
> `.gitlab-ci.yml` + Pages로 동일하게 구성할 수 있습니다. 요청하면 변환해 드립니다.

---

## 문서 추가하는 법 (이게 전부입니다)

1. `docs/` 아래 원하는 폴더에 `.html` 파일을 넣습니다
   (폴더가 없으면 새로 만들면 됩니다 — 폴더가 곧 트리 가지)
2. push
   ```bash
   git add . && git commit -m "add: 결제 POC" && git push
   ```
3. 1~2분 뒤 트리에 **자동으로** 나타납니다. 인덱스는 손대지 않습니다.

공유는 Pages URL 하나를 계속 던지면 됩니다.
특정 문서 링크가 필요하면, 그 문서를 연 뒤 화면의 **🔗 링크 복사** 버튼을 누르세요.

---

## 규칙 몇 가지

| 하고 싶은 것 | 방법 |
|---|---|
| 트리 순서 정하기 | 파일·폴더명 앞에 `01_`, `02_` (숫자는 화면에 안 보임) |
| 문서 제목 정하기 | HTML의 `<title>` 또는 첫 `<h1>` 이 자동으로 트리 라벨이 됨 |
| 카테고리 나누기 | `docs/` 아래 폴더를 만들면 트리 가지가 됨 |
| 트리에서 숨기기 | 파일·폴더명을 `_` 로 시작 (예: `_초안/`) |

---

## 구조

```
├─ index.html            ← 트리 뷰어 (손댈 필요 없음)
├─ manifest.json         ← 자동 생성됨 (직접 수정 금지)
├─ scripts/build-tree.mjs← docs/를 훑어 트리를 만드는 스크립트
├─ .github/workflows/    ← push마다 트리 재생성 + 배포
└─ docs/                 ← 여기에 HTML을 넣기만 하면 됨
    ├─ poc/
    ├─ 아키텍처/
    └─ 기획/
```
