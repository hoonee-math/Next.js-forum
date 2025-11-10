# NextAuth Adapter와 CredentialsProvider 호환성 문제

## 목차

1. [개요](#개요)
2. [문제의 본질](#문제의-본질)
3. [모든 Adapter가 영향을 받는다](#모든-adapter가-영향을-받는다)
4. [Adapter의 역할과 설계](#adapter의-역할과-설계)
5. [CredentialsProvider의 특성](#credentialsprovider의-특성)
6. [NextAuth 공식 문서 확인](#nextauth-공식-문서-확인)
7. [실제 예시](#실제-예시)
8. [해결 방법](#해결-방법)
9. [결론](#결론)

---

## 개요

NextAuth에서 **모든 Database Adapter는 CredentialsProvider와 호환되지 않습니다.**

이는 MongoDBAdapter만의 문제가 아니라, NextAuth의 근본적인 설계 철학에서 비롯된 제약사항입니다.

**핵심:**
- Adapter = OAuth + Database Session 방식
- CredentialsProvider = JWT 방식
- 두 방식은 근본적으로 다름

---

## 문제의 본질

### 잘못된 인식

❌ "MongoDBAdapter와 CredentialsProvider가 충돌하는구나"

### 올바른 이해

✅ "모든 Adapter와 CredentialsProvider는 근본적으로 호환되지 않는다"

### 왜 호환되지 않는가

**Adapter의 목적:**
- OAuth Provider를 위한 Database Session 관리
- 자동으로 users, accounts, sessions 테이블 생성/관리

**CredentialsProvider의 목적:**
- ID/PW 기반 인증
- JWT 전용
- 개발자가 직접 DB 관리

**결과:**
두 시스템이 서로 다른 방식으로 작동하여 충돌 발생

---

## 모든 Adapter가 영향을 받는다

### NextAuth 지원 Adapter 목록

```javascript
// Database Adapters
import { PrismaAdapter } from "@auth/prisma-adapter"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { TypeORMAdapter } from "@auth/typeorm-adapter"
import { SupabaseAdapter } from "@auth/supabase-adapter"
import { FirestoreAdapter } from "@auth/firebase-adapter"
import { PostgresAdapter } from "@auth/postgres-adapter"
import { MySQLAdapter } from "@auth/mysql-adapter"
import { DynamoDBAdapter } from "@auth/dynamodb-adapter"
// ... 등등
```

**모든 Adapter가 CredentialsProvider와 호환되지 않습니다.**

### 호환성 표

| Adapter | CredentialsProvider 호환 | 이유 |
|---------|--------------------------|------|
| MongoDBAdapter | ❌ | Database Session 전용 |
| PrismaAdapter | ❌ | Database Session 전용 |
| DrizzleAdapter | ❌ | Database Session 전용 |
| SupabaseAdapter | ❌ | Database Session 전용 |
| FirestoreAdapter | ❌ | Database Session 전용 |
| TypeORMAdapter | ❌ | Database Session 전용 |
| PostgresAdapter | ❌ | Database Session 전용 |
| MySQLAdapter | ❌ | Database Session 전용 |
| DynamoDBAdapter | ❌ | Database Session 전용 |

---

## Adapter의 역할과 설계

### Adapter가 하는 일

Adapter는 **Database Session 방식**을 위해 설계되었습니다:

#### 1. OAuth 로그인 시 자동으로

- `users` 테이블: 사용자 정보 저장
- `accounts` 테이블: OAuth 계정 정보 저장 (provider, access_token 등)
- `sessions` 테이블: 세션 생성 및 관리
- `verification_tokens` 테이블: 이메일 인증 토큰 저장

#### 2. 세션 관리

- 로그인 시: DB에 세션 레코드 생성
- 요청 시: DB에서 세션 유효성 확인
- 로그아웃 시: DB에서 세션 삭제

### Database 스키마 예시

#### Prisma Schema

```prisma
// User 모델
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
}

// Account 모델 (OAuth 계정 정보)
model Account {
  id                 String  @id @default(cuid())
  userId             String
  type               String
  provider           String  // "google", "github" 등
  providerAccountId  String
  refresh_token      String? @db.Text
  access_token       String? @db.Text
  expires_at         Int?
  token_type         String?
  scope              String?
  id_token           String? @db.Text
  session_state      String?
  user               User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

// Session 모델 (Database Session)
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// VerificationToken 모델
model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

#### MongoDB Schema (자동 생성)

```javascript
// users 컬렉션
{
  _id: ObjectId("..."),
  name: "홍길동",
  email: "user@example.com",
  emailVerified: ISODate("2024-01-01"),
  image: "https://avatars.githubusercontent.com/..."
}

// accounts 컬렉션
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),
  type: "oauth",
  provider: "github",
  providerAccountId: "12345678",
  access_token: "gho_...",
  refresh_token: "ghr_...",
  expires_at: 1704067200,
  token_type: "bearer",
  scope: "read:user,user:email"
}

// sessions 컬렉션
{
  _id: ObjectId("..."),
  sessionToken: "abc123...",
  userId: ObjectId("..."),
  expires: ISODate("2024-02-01")
}
```

### Adapter의 동작 흐름

```
1. 사용자가 "Sign in with Github" 클릭
   ↓
2. Github OAuth 인증 완료
   ↓
3. NextAuth가 Adapter 호출
   ↓
4. Adapter가 자동으로:
   - users 테이블에서 기존 사용자 찾기
   - 없으면 새 User 생성
   - accounts 테이블에 Github 계정 정보 저장
   - sessions 테이블에 세션 생성
   ↓
5. 세션 토큰을 쿠키에 저장
   ↓
6. 이후 요청 시마다 DB에서 세션 확인
```

---

## CredentialsProvider의 특성

### CredentialsProvider가 하는 일

#### 1. JWT 전용

```javascript
session: {
  strategy: 'jwt',  // JWT 강제
  maxAge: 30 * 24 * 60 * 60
}
```

- 세션을 DB에 저장하지 않음
- 쿠키에 JWT 토큰만 저장
- 매 요청 시 JWT 검증만 수행

#### 2. 수동 관리

```javascript
CredentialsProvider({
  async authorize(credentials) {
    // 개발자가 직접 구현
    let db = (await connectDB).db('forum');
    let user = await db.collection('user_cred').findOne({
      email: credentials.email
    });

    // 비밀번호 검증
    const pwcheck = await bcrypt.compare(
      credentials.password,
      user.password
    );

    if (!pwcheck) return null;
    return user;  // 성공 시 user 반환
  }
})
```

#### 3. Adapter 불필요

- OAuth처럼 `accounts` 테이블 필요 없음
- `sessions` 테이블 사용 안 함
- `users` 테이블만 있으면 됨

### CredentialsProvider의 동작 흐름

```
1. 사용자가 ID/PW 입력
   ↓
2. authorize() 함수 실행
   ↓
3. 개발자가 직접:
   - DB에서 사용자 찾기
   - 비밀번호 검증
   - user 객체 반환
   ↓
4. NextAuth가 JWT 생성
   ↓
5. JWT를 쿠키에 저장
   ↓
6. 이후 요청 시 JWT만 검증 (DB 조회 없음)
```

### Adapter vs CredentialsProvider 비교

| 항목 | Adapter (OAuth) | CredentialsProvider |
|------|----------------|---------------------|
| 세션 방식 | Database Session | JWT |
| DB 테이블 | users, accounts, sessions | users만 (선택) |
| 자동 관리 | ✅ 자동 | ❌ 수동 |
| 매 요청 시 DB 조회 | ✅ 필요 | ❌ 불필요 |
| 확장성 | 제한적 | 높음 |
| 보안 | OAuth 표준 | 개발자 책임 |
| 복잡도 | 낮음 | 높음 |

---

## NextAuth 공식 문서 확인

### Credentials Provider 문서

> **Note:** The Credentials provider can only be used if JSON Web Tokens are enabled for sessions. Users authenticated with the Credentials provider are not persisted in the database.

**해석:**
- Credentials provider는 JWT가 활성화된 경우에만 사용 가능
- Credentials로 인증된 사용자는 DB에 저장되지 않음

> **Note:** The functionality provided for credentials based authentication is intentionally limited to discourage the use of passwords due to the inherent security risks associated with them and the additional complexity associated with supporting usernames and passwords.

**해석:**
- Credentials 기반 인증 기능은 의도적으로 제한됨
- 비밀번호 사용을 권장하지 않음 (보안 위험)
- ID/PW 지원은 복잡도를 증가시킴

### Database Adapter 문서

> **Note:** When using a database adapter, the Credentials provider is not supported.

**해석:**
- Database adapter 사용 시 Credentials provider는 지원되지 않음

### Session Strategy 문서

> If you use a database session strategy, you must use a database adapter. If you use JWT session strategy, you can use a database adapter for storing user data, but it's not required.

**해석:**
- Database Session 전략 → Adapter 필수
- JWT Session 전략 → Adapter 선택 (사용자 데이터 저장용으로만)

### 공식 문서 링크

- [Credentials Provider](https://next-auth.js.org/providers/credentials)
- [Database Adapters](https://authjs.dev/getting-started/adapters)
- [Session Strategies](https://next-auth.js.org/configuration/options#session)

---

## 실제 예시

### 예시 1: Prisma Adapter

#### 잘못된 설정

```javascript
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"

const prisma = new PrismaClient()

export const authOptions = {
  adapter: PrismaAdapter(prisma),  // ← Prisma Adapter 사용
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET
    }),
    CredentialsProvider({  // ← 충돌!
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // 사용자 검증 로직
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })
        if (user && verifyPassword(credentials.password, user.password)) {
          return user
        }
        return null
      }
    })
  ],
}
```

**문제점:**
- GoogleProvider: PrismaAdapter로 `users`, `accounts`, `sessions` 자동 생성
- CredentialsProvider: Adapter 무시, JWT만 사용
- 사용자가 두 곳에 분산 저장
- 예측 불가능한 동작

#### 결과

```
Prisma Database
├── users (OAuth 사용자만 저장)
├── accounts (OAuth 계정 정보)
├── sessions (OAuth 세션)
└── ... (Credentials 사용자는 어디에?)
```

### 예시 2: MongoDB Adapter

#### 잘못된 설정

```javascript
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import { connectDB } from "@/util/database"
import GithubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions = {
  adapter: MongoDBAdapter(connectDB),  // ← MongoDB Adapter 사용
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET
    }),
    CredentialsProvider({  // ← 충돌!
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        let db = (await connectDB).db('forum');
        let user = await db.collection('user_cred').findOne({
          email: credentials.email
        });
        // 비밀번호 검증...
        return user
      }
    })
  ],
}
```

**문제점:**
- Github: `test/users`, `test/accounts`, `test/sessions` 자동 생성
- Credentials: `forum/user_cred` 수동 관리
- DB가 분리됨
- 역할 관리가 복잡해짐

#### 결과

```
MongoDB
├── test (database) - Adapter가 생성
│   ├── users (Github 사용자)
│   ├── accounts
│   └── sessions
└── forum (database) - 개발자가 수동 생성
    └── user_cred (Credentials 사용자)
```

### 예시 3: Supabase Adapter

#### 잘못된 설정

```javascript
import { SupabaseAdapter } from "@auth/supabase-adapter"
import { createClient } from "@supabase/supabase-js"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

export const authOptions = {
  adapter: SupabaseAdapter({
    url: process.env.SUPABASE_URL,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET
    }),
    CredentialsProvider({  // ← 충돌!
      // ...
    })
  ],
}
```

**문제점:**
- Google: Supabase의 `auth.users`, `public.accounts` 등 사용
- Credentials: 별도 테이블 수동 관리
- Supabase Auth와 NextAuth가 혼재

---

## 해결 방법

### 방법 1: Adapter 제거 + 수동 관리 (복잡)

모든 Provider를 수동으로 관리:

```javascript
export const authOptions = {
  // adapter 제거
  providers: [
    GoogleProvider({...}),
    CredentialsProvider({...})
  ],
  session: {
    strategy: 'jwt',  // JWT 강제
  },
  callbacks: {
    jwt: async ({ token, user, account }) => {
      if (account && user) {
        // OAuth 로그인 시 수동으로 DB 저장
        if (account.provider !== 'credentials') {
          // Prisma 예시
          await prisma.user.upsert({
            where: { email: user.email },
            update: {
              name: user.name,
              image: user.image,
            },
            create: {
              email: user.email,
              name: user.name,
              image: user.image,
              provider: account.provider,
            },
          })

          // MongoDB 예시
          const db = (await connectDB).db('forum');
          await db.collection('users').updateOne(
            { email: user.email },
            {
              $set: {
                name: user.name,
                email: user.email,
                provider: account.provider,
                image: user.image,
              }
            },
            { upsert: true }
          );
        }

        token.user = {
          name: user.name,
          email: user.email,
          role: user.role || 'user'
        }
      }
      return token;
    },
    session: async ({ session, token }) => {
      session.user = token.user;
      return session;
    }
  }
}
```

**장점:**
- 모든 Provider 사용 가능
- 완전한 제어

**단점:**
- 매우 복잡
- Adapter의 장점 상실
- 유지보수 어려움
- 버그 가능성 높음

### 방법 2: OAuth만 사용 (권장)

Adapter의 장점을 최대한 활용:

```javascript
export const authOptions = {
  adapter: PrismaAdapter(prisma),
  // 또는: MongoDBAdapter(connectDB, { databaseName: 'forum' })
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET
    })
    // CredentialsProvider 제거
  ],
  callbacks: {
    // role 관리는 DB에서
    async session({ session, user }) {
      // DB에서 role 조회
      session.user.role = user.role || 'user';
      return session;
    }
  }
}
```

**장점:**
- 간단하고 명확
- NextAuth의 모든 기능 사용
- 자동 관리
- 안전함

**단점:**
- ID/PW 로그인 불가
- OAuth Provider 의존

### 방법 3: Credentials만 사용

완전한 제어:

```javascript
export const authOptions = {
  // adapter 제거
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const db = (await connectDB).db('forum');
        const user = await db.collection('users').findOne({
          email: credentials.email
        });

        if (!user) return null;

        const pwcheck = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!pwcheck) return null;

        return user;
      }
    })
    // OAuth Provider 제거
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.user = {
          name: user.name,
          email: user.email,
          role: user.role || 'user'
        }
      }
      return token;
    },
    session: async ({ session, token }) => {
      session.user = token.user;
      return session;
    }
  }
}
```

**장점:**
- 완전한 제어
- 단일 컬렉션 관리
- 복잡도 낮음

**단점:**
- OAuth 편의성 포기
- 보안 관리 책임

### 방법 4: 하이브리드 (비권장)

두 시스템을 완전히 분리:

```javascript
// NextAuth: OAuth 전용
// pages/api/auth/[...nextauth].js
export const authOptions = {
  adapter: MongoDBAdapter(connectDB, { databaseName: 'forum' }),
  providers: [
    GoogleProvider({...}),
    GithubProvider({...})
  ],
}

// 별도 API: Credentials 전용
// pages/api/auth/login.js
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    const db = (await connectDB).db('forum');
    const user = await db.collection('users').findOne({ email });

    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // JWT 직접 생성
    const token = jwt.sign(
      { email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.setHeader('Set-Cookie', `auth-token=${token}; HttpOnly; Path=/`);
    res.status(200).json({ success: true });
  }
}
```

**장점:**
- 각 시스템의 장점 활용
- 명확한 분리

**단점:**
- 두 인증 시스템 관리
- 복잡도 매우 높음
- 코드 중복

### 방법별 비교

| 방법 | 복잡도 | 유지보수 | OAuth | Credentials | 권장도 |
|------|--------|----------|-------|-------------|--------|
| 1. Adapter 제거 + 수동 | 높음 | 어려움 | ✅ | ✅ | ⭐ |
| 2. OAuth만 | 낮음 | 쉬움 | ✅ | ❌ | ⭐⭐⭐⭐⭐ |
| 3. Credentials만 | 낮음 | 보통 | ❌ | ✅ | ⭐⭐⭐⭐ |
| 4. 하이브리드 | 매우 높음 | 매우 어려움 | ✅ | ✅ | ⭐ |

---

## 결론

### 핵심 요약

1. **모든 Database Adapter는 CredentialsProvider와 호환되지 않습니다**
   - MongoDBAdapter만의 문제가 아님
   - Prisma, Drizzle, Supabase 등 모두 동일

2. **근본적인 설계 차이**
   - Adapter: Database Session 방식
   - CredentialsProvider: JWT 방식
   - 두 방식은 양립할 수 없음

3. **NextAuth의 의도**
   - OAuth 사용 권장
   - Credentials 사용 최소화 (보안 위험)
   - 명확한 분리

### 호환성 체크리스트

| 질문 | 답변 |
|------|------|
| MongoDBAdapter만의 문제? | ❌ 모든 Adapter 동일 |
| Prisma Adapter도 안 됨? | ✅ 네, 동일한 제약 |
| Supabase Adapter는? | ✅ 네, 모두 동일 |
| Drizzle Adapter도? | ✅ 네, 모두 동일 |
| 다른 DB를 써도? | ✅ 네, DB 종류와 무관 |
| 왜? | Adapter = Database Session 전용 |
| CredentialsProvider는? | JWT 전용, Adapter 불필요 |

### 권장사항

#### 새 프로젝트 시작 시

1. **OAuth만 사용** (가장 권장)
   ```javascript
   adapter: PrismaAdapter(prisma),
   providers: [GoogleProvider, GithubProvider]
   ```

2. **Credentials만 사용**
   ```javascript
   // adapter 없음
   providers: [CredentialsProvider]
   session: { strategy: 'jwt' }
   ```

#### 기존 프로젝트 리팩토링 시

1. **현재 혼용 중**
   - OAuth로 전환 (권장)
   - 또는 Credentials로 통일

2. **마이그레이션 계획**
   - 사용자 데이터 백업
   - 점진적 전환
   - 충분한 테스트

### NextAuth의 철학

NextAuth는 다음을 권장합니다:

1. **OAuth 우선**
   - Google, Github 등 OAuth Provider 사용
   - Adapter로 자동 관리

2. **Credentials 최소화**
   - 보안 위험
   - 복잡도 증가
   - 유지보수 어려움

3. **명확한 분리**
   - Database Session vs JWT
   - 혼용하지 말 것

### 마지막 조언

**"Adapter를 사용한다면 Credentials를 버리고, Credentials를 사용한다면 Adapter를 버려라"**

이것이 NextAuth의 설계 철학이며, 이를 따르는 것이 가장 안전하고 유지보수하기 쉬운 방법입니다.

---

## 참고 자료

- [NextAuth 공식 문서](https://next-auth.js.org/)
- [Credentials Provider 문서](https://next-auth.js.org/providers/credentials)
- [Database Adapters 목록](https://authjs.dev/getting-started/adapters)
- [Session Strategies](https://next-auth.js.org/configuration/options#session)
- [Prisma Adapter](https://authjs.dev/reference/adapter/prisma)
- [MongoDB Adapter](https://authjs.dev/reference/adapter/mongodb)
