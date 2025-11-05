## 🧭 Next.js App Router vs Pages Router

Next.js는 버전 13부터 새로운 **App Router** 구조를 도입했습니다.
기존 **Pages Router**와는 라우팅, 데이터 패칭, API 작성 방식이 다릅니다.

### ⚙️ App Router vs Pages Router 차이점

| 구분 | **Pages Router (구버전)** | **App Router (Next.js 13+)** |
|------|---------------------------|------------------------------|
| **폴더 구조** | `pages/` 폴더 | `app/` 폴더 |
| **API 라우트 경로** | `pages/api/test.js` → `/api/test` | `app/api/test/route.js` → `/api/test` ⚠️ |
| **API 파일명 규칙** | 아무 이름이나 가능 (예: `test.js`) | **반드시 `route.js`** 여야 함 |
| **라우팅 훅** | `import { useRouter } from 'next/router'` | `import { useRouter } from 'next/navigation'` |
| **데이터 패칭** | `getServerSideProps`, `getStaticProps` | `fetch()` + `async` Server Component |
| **렌더링 방식** | Client 중심 (CSR) | Server 중심 (SSR/SSG 자동 처리) |
| **파일 구조 예시** | `pages/index.js` | `app/page.js`, `app/layout.js`, `app/loading.js` 등 |

> ⚠️ **혼용 가능**: `app/` 폴더와 `pages/` 폴더를 동시에 사용할 수 있습니다.
> - `app/` 폴더: 페이지 라우팅
> - `pages/api/` 폴더: API 라우팅만 담당
>
> 단, API 경로는 **한쪽에만** 정의해야 충돌을 피할 수 있습니다!

---

## ✅ App Router 프로젝트 확인 체크리스트

### ① 폴더 구조 확인
- 루트에 **`app/` 폴더**가 있다 → ✅ App Router
- **`pages/` 폴더**만 있다 → 📦 Pages Router

---

### ② 라우팅 훅 확인
- `import { useRouter } from 'next/navigation'` → ✅ App Router
- `import { useRouter } from 'next/router'` → 📦 Pages Router

---

### ③ 데이터 패칭 방식 확인
- `fetch()`를 **서버 컴포넌트(`async function Page()`)** 안에서 사용 → ✅ App Router
- `getServerSideProps`, `getStaticProps` 사용 → 📦 Pages Router

---

### 📘 요약
> `app/` 폴더 + `next/navigation` + 서버 컴포넌트(`async function`)
> 이 세 가지가 보이면 100% **App Router 프로젝트**입니다 🎯
>
> **하이브리드 구조**도 가능:
> - `app/` 폴더로 페이지 작성 (App Router)
> - `pages/api/` 폴더로 API만 작성 (Pages Router)
>
> ⚠️ **중요**: App Router에서 API를 만들려면 `app/api/test/route.js`처럼 **`route.js`** 파일명을 사용해야 합니다!
