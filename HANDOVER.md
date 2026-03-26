# HANDOVER.md — 올짤에디터 프로젝트 인수인계 문서

> 최종 수정: 2026-03-26  
> 프로젝트 상태: **MVP 2차 완료 (원본비율 배경 + 만능대가리 배치 + 다운로드)**

---

## 1. 프로젝트 개요

### 목적
웹 브라우저에서 동작하는 이미지 편집 툴 **올짤에디터**.  
사진을 원본 비율 그대로 배경으로 불러오고, 미리 준비된 **만능대가리**(스티커)를 붙여 꾸민 뒤 PNG로 다운로드한다.

### 용어 정리
| 서비스 내 명칭 | 의미 |
|---|---|
| **올짤에디터** | 서비스/앱 전체 이름 |
| **만능대가리** | 스티커를 부르는 서비스 내 명칭 |

### 기술 스택
| 항목 | 결정 | 이유 |
|---|---|---|
| 호스팅 | GitHub Pages | 무료, 백엔드 불필요 |
| 언어 | 순수 HTML / CSS / JS | 빌드 툴 없이 단일 파일 배포 |
| 캔버스 엔진 | Fabric.js 5.3.1 (CDN) | 드래그·회전·리사이즈 내장 |
| 폰트 | Google Fonts CDN | Noto Sans KR + Gmarket Sans |
| UI 언어 | 한국어 | |
| 반응형 | PC + 모바일 | 모바일은 바텀시트 패턴 |

### 만능대가리 관련 결정
| 항목 | 결정 |
|---|---|
| 파일 보유 방식 | 직접 제작한 이미지 파일 |
| 총 수량 | 약 200종 |
| 카테고리 수 | 7개 (IA / HA / CL / PC / OR / LO / WM) |
| 카테고리 UI | 탭 + 그리드 필터 |
| manifest.json 생성 | Node.js 스크립트 자동 생성 (방법 B 채택) |

---

## 2. 파일 구조

```
your-github-repo/
├── index.html              ← 앱 전체 (HTML + CSS + JS 단일 파일)
├── generate-manifest.js    ← manifest.json 자동 생성 스크립트
├── README.md               ← 배포 가이드
├── HANDOVER.md             ← 이 문서
└── img/
    ├── manifest.json       ← 자동 생성됨 (직접 수정 금지)
    ├── IA/
    │   ├── sticker_01.png
    │   └── ...
    ├── HA/
    ├── CL/
    ├── PC/
    ├── OR/
    ├── LO/
    └── WM/
```

---

## 3. manifest.json 생성 방법

### 실행
```bash
# img/ 폴더에 이미지를 넣은 뒤
node generate-manifest.js

# 출력 예시:
# ✅ IA/  → 28개
# ✅ HA/  → 31개
# ...
# 📄 manifest.json 생성 완료
```

### 언제 실행하나?
- 만능대가리 이미지를 **추가/삭제/이름변경** 할 때마다 실행 후 commit & push
- `img/manifest.json` 은 스크립트가 덮어쓰므로 직접 편집하지 말 것

### 카테고리 표시 이름 변경
`generate-manifest.js` 상단의 `CATEGORY_LABELS` 객체를 수정:
```js
const CATEGORY_LABELS = {
  IA: '인물A',   // 원하는 한글명으로 변경 가능
  HA: '표정',
  // ...
};
```

---

## 4. 현재 구현된 기능 (MVP v2)

### ✅ 이미지 불러오기
- 로컬 파일 업로드 (클릭 또는 드래그&드롭)
- URL 직접 입력
- **원본 이미지 비율 그대로 캔버스 크기 결정** (1300×500이면 그대로)
- 한 변이 4000px 초과 시 비율 유지하며 자동 축소 + 토스트 알림
- 화면보다 캔버스가 크면 스크롤로 탐색 가능
- 화면보다 작으면 자동 중앙 정렬
- 탑바에 현재 캔버스 해상도 표시 (예: `1300 × 500px`)

### ✅ 만능대가리
- `img/manifest.json` 기반으로 카테고리 탭 + 그리드 자동 생성
- manifest.json 없으면 데모 샘플로 폴백 (개발 중 편의)
- 클릭 시 캔버스 중앙에 추가 (캔버스 단변의 25% 크기)
- 변형: 크기·회전·투명도 슬라이더
- 반전: 좌우(flipX), 상하(flipY)
- 레이어: 앞으로(bringToFront), 뒤로(sendBackwards)
- 삭제: 버튼 또는 키보드 Delete/Backspace

### ✅ 캔버스
- 배경 이미지 원본 비율 유지
- `displayScale`로 화면 표시 비율 자동 계산
- 되돌리기(Undo) 최대 30단계

### ✅ 다운로드
- `multiplier: 1 / displayScale` → 원본 해상도 PNG 저장
- 파일명: `olzzal-edit.png`

### ✅ 반응형 (모바일)
- 768px 이하: 우측 패널 숨김, 하단 네비바 표시
- 만능대가리 선택: 바텀시트 슬라이드업
- 편집 컨트롤: 별도 바텀시트

---

## 5. 미개발 영역

### 🔲 Priority 1 — 핵심 편집 기능

#### 텍스트 삽입
- 폰트 3종 선택 (Noto Sans KR / Gmarket Sans / 나눔명조 등)
- 색상 선택 (컬러피커)
- Fabric.js `IText` 사용 → 더블클릭 인라인 편집
```js
const text = new fabric.IText('텍스트 입력', {
  left: canvasW / 2, top: canvasH / 2,
  fontFamily: 'Noto Sans KR',
  fontSize: 40,
  fill: '#ffffff',
  originX: 'center', originY: 'center',
});
canvas.add(text);
```

#### 도형 삽입
- 사각형(`Rect`), 원(`Circle`), 선(`Line`)
- 각 도형의 fill·stroke·strokeWidth 조절 UI
```js
const rect   = new fabric.Rect({ width:200, height:150, fill:'rgba(255,0,0,0.5)', left:100, top:100 });
const circle = new fabric.Circle({ radius:80, fill:'rgba(0,128,255,0.5)', left:200, top:200 });
const line   = new fabric.Line([50,50,300,50], { stroke:'#fff', strokeWidth:4 });
```

### 🔲 Priority 2 — UX 개선

| 항목 | 내용 |
|---|---|
| Redo (다시 실행) | `history[]` + `redoStack[]` 구조 분리 |
| 배경색 선택 | 이미지 없이 단색/그라디언트 배경으로 시작 |
| 만능대가리 검색 | manifest에 `name` 필드 추가 후 필터링 |
| 다중 선택 그룹화 | Shift+클릭은 Fabric.js 기본 지원, UI 안내만 추가 |

### 🔲 Priority 3 — 추가 기능

| 항목 | 내용 |
|---|---|
| 즐겨찾기 | localStorage로 자주 쓰는 만능대가리 저장 |
| 최근 사용 탭 | 마지막 사용 N개 별도 탭 |
| 이미지 필터 | 밝기·대비·채도 (Fabric.js filters) |
| JPG 다운로드 | 포맷 선택 추가 |
| 복제 | Ctrl+D로 선택 오브젝트 복사 |
| 캔버스 클리어 | 전체 초기화 버튼 |

---

## 6. 로컬 개발 환경

```bash
# 1. 레포 클론
git clone https://github.com/[유저명]/[레포명].git
cd [레포명]

# 2. 만능대가리 이미지 추가 후 manifest 생성
node generate-manifest.js

# 3. 로컬 서버 실행 (fetch가 file:// 에서 안 되므로 필수)
npx serve .
# 또는
python3 -m http.server 8080

# 4. http://localhost:3000 (또는 8080) 에서 확인
```

> ⚠️ `index.html`을 더블클릭으로 직접 열면 `fetch('./img/manifest.json')`이 CORS 오류 남.  
> 반드시 로컬 서버를 통해 접속할 것.

---

## 7. GitHub Pages 배포

```bash
# 1. 만능대가리 이미지 img/ 에 넣기
# 2. manifest 갱신
node generate-manifest.js

# 3. commit & push
git add .
git commit -m "만능대가리 추가 및 manifest 갱신"
git push
```

Settings → Pages → Branch: `main` / `/ (root)` → Save  
→ `https://[유저명].github.io/[레포명]/`

> 이미지 200장 이상은 웹 UI보다 CLI push 권장

---

## 8. 코드 구조 (index.html)

| 영역 | 위치 | 설명 |
|---|---|---|
| CSS | `<style>` | CSS 변수 기반 다크 테마 |
| HTML | `<body>` | topbar → main(canvas+panel) → mobile sheets |
| `loadManifest()` | JS 상단 | fetch + 폴백 |
| `applyDisplayScale()` | JS | 캔버스 화면 비율 계산·적용 |
| `loadImageToCanvas()` | JS | 원본비율 배경 로드 |
| `buildStickerUI()` | JS | 탭·그리드 동적 생성 |
| `addSticker()` | JS | 만능대가리 캔버스 추가 |
| `updateControls()` | JS | 선택 오브젝트 → 슬라이더 동기화 |
| `download()` | JS | 원본해상도 PNG 저장 |

---

## 9. 알려진 이슈 및 주의사항

| 이슈 | 내용 | 해결 방법 |
|---|---|---|
| 외부 이미지 CORS | 다른 도메인 URL 입력 시 다운로드 시 캔버스 오염 가능 | 만능대가리는 같은 레포에 두면 문제없음 |
| `file://` 직접 열기 | manifest fetch 실패 → 데모 샘플로 폴백됨 | `npx serve .` 로 로컬 서버 사용 |
| Redo 미구현 | 되돌리기만 가능 | Priority 2 작업 대상 |
| 모바일 바텀시트 | 외부 탭 감지 로직이 완벽하지 않음 | backdrop overlay 레이어 추가 권장 |

---

## 10. 의존성

```
Fabric.js 5.3.1
  CDN: https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js
  라이선스: MIT

Google Fonts (Noto Sans KR, Gmarket Sans)
  라이선스: OFL

Node.js (generate-manifest.js 실행 시만 필요, 배포 서버에는 불필요)
```

백엔드·데이터베이스·npm 패키지 없음. 브라우저 + 인터넷 연결만으로 동작.

---

## 11. 다음 개발자에게

- 코드는 `index.html` 한 파일 안에 전부 있다. CSS → HTML → JS 순서.
- 만능대가리 이미지 변경 시 항상 `node generate-manifest.js` 실행 후 commit.
- 새 기능 추가 시 `saveHistory()` 패턴 유지 → Undo 동작 보장.
- 모바일 컨트롤은 데스크탑과 별도 ID(`-m` 접미사), `syncSlider()`로 양쪽 동기화.
- `displayScale`은 화면 표시용 축소 비율. 다운로드 시 `1/displayScale`로 원본 해상도 복원.
- Fabric.js 공식 문서: http://fabricjs.com/docs/
