# Next.js 를 이용한 Forum

## 🛠 Tech Stack

| 영역 | 기술 |
|------|------|
| **Framework** | Next.js 14 (React 18 기반 App Router) |
| **Language** | JavaScript (ES6+) |
| **Styling** | CSS Modules / Global CSS |
| **Database** | MongoDB + Mongoose |
| **Authentication** | NextAuth.js (소셜 로그인) |
| **Server** | Next.js API Routes (풀스택 구조) |
| **Version Control** | Git / GitHub |


## Next.js 에서의 서버

Next.js에서는 app/api (최신) 또는 pages/api 폴더 안의 파일들이 서버 역할을 합니다.

### 🔹 Next.js 버전에 따른 서버(API) 폴더 차이
| 버전                             | 폴더 경로       | 역할 / 방식                   | 비고                     |
| ------------------------------ | ----------- | ------------------------- | ---------------------- |
| **Next.js 13 이전**              | `pages/api` | 각 파일이 API 라우트로 동작         | 기존 방식 (Pages Router)   |
| **Next.js 13~14 (App Router)** | `app/api`   | **Route Handler** 방식으로 동작 | 최신 방식 (App Router)     |
| **Next.js 13 이후에도**            | `pages/api` | 여전히 지원됨 (하위 호환용)          | 단, App Router와 혼용은 비추천 |

## Database

본 프로젝트는 MongoDB Atlas (DaaS) 를 사용하여 데이터를 관리합니다.

![alt text](/docs/MongoDB-Atlas.png)

---

### ⚠️ 주의사항
- app/ 디렉토리를 사용하는 App Router 프로젝트에서는 app/api 구조를 사용하는 게 권장됩니다.
- pages/ 구조와 app/ 구조를 혼용하면 충돌하거나, 라우팅 우선순위 문제로 예상치 못한 동작이 생길 수 있어요.
- 즉, 프로젝트가 App Router 기반이라면 → app/api\
기존 Pages Router 기반이라면 → pages/api
