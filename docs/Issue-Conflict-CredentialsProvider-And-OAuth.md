# CredentialsProvider와 OAuth의 충돌 문제

## 목차

1. [개요](#개요)
2. [Database 구조 문제](#database-구조-문제)
3. [CredentialsProvider와 OAuth 혼용 이슈](#credentialsprovider와-oauth-혼용-이슈)
4. [NextAuth vs Spring Boot](#nextauth-vs-spring-boot)
5. [권장사항](#권장사항)

---

## 개요

이 문서는 NextAuth를 사용한 포럼 프로젝트에서 관리자 권한을 구현하는 과정에서 발견한 설계 이슈와 해결 방안을 정리합니다.

**프로젝트 구성:**
- Next.js 13+ (App Router)
- NextAuth v4
- MongoDB
- CredentialsProvider + OAuth (Github, Google)

---

## Database 구조 문제

### 현재 구조

```
MongoDB Cluster
├── forum (database)
│   ├── user_cred (collection) - CredentialsProvider 사용자
│   └── post (collection)
└── test (database)
    ├── users (collection) - OAuth 사용자
    ├── accounts (collection)
    └── sessions (collection)
```

### 문제점

1. **사용자가 두 곳에 분산**
   - CredentialsProvider: `forum/user_cred`
   - OAuth: `test/users`

2. **test DB가 생성된 이유**
   - `MongoDBAdapter(connectDB)`가 기본 DB를 사용
   - `database.js`에서 DB 이름을 지정하지 않음

3. **sessions 컬렉션의 미사용**
   - JWT 모드(`strategy: 'jwt'`)에서는 sessions 컬렉션 사용 안 함
   - 쿠키에 JWT로 세션 저장

### 해결 방법

MongoDBAdapter에 database 이름 지정:

```javascript
adapter: MongoDBAdapter(connectDB, { databaseName: 'forum' })
```

이렇게 하면:
- OAuth 사용자: `forum/users`, `forum/accounts`
- Credentials 사용자: `forum/user_cred`

모두 `forum` DB로 통합됩니다.

---

## CredentialsProvider와 OAuth 혼용 이슈

### NextAuth의 제약사항

**CredentialsProvider는 MongoDBAdapter와 호환되지 않습니다.**

NextAuth 공식 문서:
> Credentials provider는 database adapter와 함께 사용할 수 없습니다.

### 현재 설정의 문제

```javascript
export const authOptions = {
  providers: [
    GithubProvider({...}),
    GoogleProvider({...}),
    CredentialsProvider({...})  // ← adapter와 충돌
  ],
  session: {
    strategy: 'jwt',
  },
  adapter: MongoDBAdapter(connectDB)  // ← Credentials와 충돌
};
```

### 왜 충돌하는가

1. **MongoDBAdapter의 역할**
   - OAuth 로그인 시 `users`, `accounts`, `sessions` 자동 생성/관리
   - Database Session 모드 지원

2. **CredentialsProvider의 특성**
   - DB 관리를 개발자가 직접 수행
   - JWT 모드만 지원
   - Adapter가 있어도 무시됨

3. **결과**
   - OAuth 사용자는 Adapter로 관리
   - Credentials 사용자는 수동 관리
   - 두 시스템이 분리되어 혼란 발생

### 해결 방법

#### 옵션 A: OAuth만 사용 (권장)

```javascript
export const authOptions = {
  providers: [
    GithubProvider({...}),
    GoogleProvider({...})
    // CredentialsProvider 제거
  ],
  adapter: MongoDBAdapter(connectDB, { databaseName: 'forum' })
};
```

**장점:**
- NextAuth의 장점을 최대한 활용
- 자동 사용자 관리
- 간단한 구조

**단점:**
- ID/PW 로그인 불가

#### 옵션 B: Credentials만 사용

```javascript
export const authOptions = {
  providers: [
    CredentialsProvider({...})
    // OAuth 제거
  ],
  session: {
    strategy: 'jwt',
  },
  // adapter 제거
};
```

**장점:**
- 완전한 제어
- 단일 컬렉션 관리

**단점:**
- OAuth 편의성 포기

#### 옵션 C: 둘 다 사용 (복잡, 비권장)

adapter를 제거하고 OAuth도 수동 관리:

```javascript
export const authOptions = {
  providers: [
    GithubProvider({...}),
    GoogleProvider({...}),
    CredentialsProvider({...})
  ],
  session: {
    strategy: 'jwt',
  },
  // adapter 제거
  callbacks: {
    jwt: async ({ token, user, account }) => {
      if (account && user) {
        const db = (await connectDB).db('forum');

        // OAuth 로그인 시 수동으로 DB 저장
        if (account.provider !== 'credentials') {
          await db.collection('users').updateOne(
            { email: user.email, provider: account.provider },
            {
              $set: {
                name: user.name,
                email: user.email,
                provider: account.provider,
                image: user.image,
                role: 'user'
              }
            },
            { upsert: true }
          );
        }

        token.user = {
          name: user.name,
          email: user.email,
          role: user.role || 'user'
        };
      }
      return token;
    }
  }
};
```

**장점:**
- 모든 기능 사용 가능

**단점:**
- 매우 복잡
- 유지보수 어려움
- NextAuth의 장점 상실

### 같은 이메일로 여러 Provider 연동

**기본 동작:**
- Github으로 로그인 → User A 생성
- Google로 로그인 (같은 이메일) → User B 생성 (별개!)

**이유:**
- NextAuth는 `provider + providerId`로 사용자 구분
- 이메일이 같아도 다른 사용자로 취급
- 보안상 이유: 이메일은 검증되지 않을 수 있음

**Account Linking 구현:**
복잡하고 보안 이슈가 있어 권장하지 않습니다.

---

## NextAuth vs Spring Boot

### 비교표

| 항목 | NextAuth (Next.js) | Spring Security (Spring Boot) |
|------|-------------------|------------------------------|
| **OAuth 연동** | ⭐⭐⭐⭐⭐ 매우 쉬움 | ⭐⭐⭐ 보통 |
| **유연성** | ⭐⭐ 제한적 | ⭐⭐⭐⭐⭐ 매우 유연 |
| **학습 곡선** | ⭐⭐⭐ 쉬움 | ⭐⭐ 어려움 |
| **커스터마이징** | ⭐⭐ 제한적 | ⭐⭐⭐⭐⭐ 무제한 |
| **복잡한 인증** | ⭐⭐ 어려움 | ⭐⭐⭐⭐⭐ 쉬움 |
| **MVP 개발** | ⭐⭐⭐⭐⭐ 최적 | ⭐⭐⭐ 보통 |

### NextAuth의 장점

1. **OAuth 통합이 매우 쉬움**
   - 5분 만에 Github, Google 연동
   - Access token, refresh token 자동 관리
   - 수십 개의 Provider 지원

2. **보안 베스트 프랙티스 내장**
   - CSRF 보호
   - JWT 서명/검증
   - Secure cookie 설정

3. **Next.js와 완벽한 통합**
   - Server Component, API Route 지원
   - `getServerSession()`, `useSession()` 편리

### NextAuth의 단점

1. **유연성 부족**
   - 복잡한 요구사항 구현 어려움
   - Credentials + OAuth 동시 사용 복잡

2. **추상화의 한계**
   - 내부 동작 이해 어려움
   - 커스터마이징 제한적

3. **문서화 부족**
   - 예시가 단편적
   - Edge case 설명 부족

### 프로젝트 규모별 추천

#### 소규모 (1-3명, 1-3개월)

**NextAuth 사용**
- OAuth만 사용
- Credentials 필요하면 별도 구현

#### 중규모 (3-10명, 6개월+)

**선택지:**
1. NextAuth (OAuth) + 자체 인증 API 분리
2. Passport.js (더 유연)
3. 직접 구현

#### 대규모 (10명+, 1년+)

**Spring Boot + Spring Security**
- 완전한 제어
- 복잡한 요구사항 대응

### 사용 사례

#### NextAuth가 적합한 경우

- SaaS 제품 (Google 로그인만)
- 내부 도구 (Github 조직 연동)
- 프로토타입, MVP

#### Spring Boot가 나은 경우

- 은행 시스템
- ERP/CRM
- 멀티테넌트 SaaS
- 세밀한 권한 제어 필요

---

## 권장사항

### 현재 프로젝트 상황

**문제점:**
- NextAuth의 장점을 살리지 못함
- CredentialsProvider + OAuth 충돌
- 복잡도만 증가

### 옵션별 선택 가이드

#### Option A: NextAuth 제대로 쓰기 (권장)

```javascript
// OAuth만 사용
providers: [
  GithubProvider(...),
  GoogleProvider(...)
]
// Credentials 제거
// adapter: MongoDBAdapter(connectDB, { databaseName: 'forum' })
```

**추천 대상:**
- OAuth 로그인만으로 충분한 경우
- 빠른 개발이 중요한 경우

#### Option B: 직접 구현

```javascript
// NextAuth 완전 제거
// JWT 직접 구현 (jsonwebtoken 라이브러리)
// Passport.js 고려
```

**추천 대상:**
- 완전한 제어가 필요한 경우
- 복잡한 인증 로직이 필요한 경우

#### Option C: 하이브리드 (현실적)

```javascript
// OAuth: NextAuth 사용
// ID/PW: 별도 API 구현 (/api/auth/login)
// 두 시스템 분리
```

**추천 대상:**
- 두 방식 모두 필요한 경우
- 복잡도를 감수할 수 있는 경우

#### Option D: 학습용 유지

**현재 상태 유지**

**추천 대상:**
- NextAuth의 한계를 학습하는 중
- 프로덕션이 아닌 학습 프로젝트

### 마이그레이션 체크리스트

#### OAuth 전용으로 전환 시

- [ ] CredentialsProvider 제거
- [ ] `/api/auth/register` 제거 또는 수정
- [ ] `user_cred` 컬렉션 데이터 이전
- [ ] MongoDBAdapter database 이름 지정
- [ ] 로그인 페이지 UI 업데이트

#### Credentials 전용으로 전환 시

- [ ] GithubProvider, GoogleProvider 제거
- [ ] MongoDBAdapter 제거
- [ ] `test` DB 데이터 정리
- [ ] OAuth 관련 환경변수 제거

#### 하이브리드 구현 시

- [ ] MongoDBAdapter 제거
- [ ] OAuth 사용자 수동 관리 로직 추가
- [ ] 사용자 컬렉션 스키마 통일
- [ ] 통합 사용자 조회 로직 구현

---

## 참고 자료

- [NextAuth 공식 문서](https://next-auth.js.org/)
- [NextAuth Credentials Provider](https://next-auth.js.org/providers/credentials)
- [NextAuth MongoDB Adapter](https://authjs.dev/reference/adapter/mongodb)
- [Next.js App Router Authentication](https://nextjs.org/docs/app/building-your-application/authentication)
