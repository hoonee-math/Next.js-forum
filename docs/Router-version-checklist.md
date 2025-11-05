## 🧭 Next.js App Router vs Pages Router

Next.js는 버전 13부터 새로운 **App Router** 구조를 도입했습니다.
기존 **Pages Router**와는 라우팅, 데이터 패칭, API 작성 방식이 다릅니다.

### ⚙️ App Router vs Pages Router 차이점

| 구분 | **Pages Router (구버전)** | **App Router (Next.js 13+)** |
|------|---------------------------|------------------------------|
| **폴더 구조** | `pages/` 폴더 | `app/` 폴더 |
| **API 라우트 경로** | `pages/api/*` | `app/api/*/route.js` |
| **라우팅 훅** | `import { useRouter } from 'next/router'` | `import { useRouter } from 'next/navigation'` |
| **데이터 패칭** | `getServerSideProps`, `getStaticProps` | `fetch()` + `async` Server Component |
| **렌더링 방식** | Client 중심 (CSR) | Server 중심 (SSR/SSG 자동 처리) |
| **파일 구조 예시** | `pages/index.js` | `app/page.js`, `app/layout.js`, `app/loading.js` 등 |

> ⚠️ `app/` 구조와 `pages/` 구조를 혼용하면 라우팅 충돌이 발생할 수 있으므로,
> 프로젝트에서는 한쪽만 선택해서 사용하는 것이 권장됩니다.

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
