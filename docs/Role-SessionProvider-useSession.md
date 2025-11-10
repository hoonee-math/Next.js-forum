# NextAuth 관리자 권한 구현 및 설계 이슈 정리

## 목차

1. [개요](#개요)
2. [관리자 권한 구현](#관리자-권한-구현)
3. [JWT와 Role 데이터 흐름](#jwt와-role-데이터-흐름)
4. [SessionProvider와 useSession](#sessionprovider와-usesession)

---

## 개요

이 문서는 NextAuth를 사용한 포럼 프로젝트에서 관리자 권한을 구현하는 과정에서 발견한 설계 이슈와 해결 방안을 정리합니다.

**프로젝트 구성:**
- Next.js 13+ (App Router)
- NextAuth v4
- MongoDB
- CredentialsProvider + OAuth (Github, Google)

---

## 관리자 권한 구현

### 기본 개념

NextAuth의 JWT callbacks를 활용하여 사용자 역할(role)을 토큰에 포함시킵니다.

### 구현 단계

#### 1단계: JWT에 role 추가

`pages/api/auth/[...nextauth].js`에서 JWT callback 수정:

```javascript
callbacks: {
  jwt: async ({ token, user }) => {
    if (user) {
      token.user = {};
      token.user.name = user.name
      token.user.email = user.email
      token.user.role = user.role || 'user' // role 추가 (기본값: 'user')
    }
    return token;
  },
  session: async ({ session, token }) => {
    session.user = token.user;
    return session;
  },
}
```

#### 2단계: API에서 권한 체크

`pages/api/post/delete.js`:

```javascript
const session = await getServerSession(req, res, authOptions);

const isAdmin = session.user.role === 'admin';
const isAuthor = session.user.email === post.author;

if(!isAdmin && !isAuthor) {
  return res.status(403).json({ message: '요청에 대한 권한이 없습니다' });
}
```

#### 3단계: 클라이언트에서 관리자 확인

`app/list/ListItem.js`:

```javascript
const { data: session } = useSession();

const isAdmin = session?.user?.role === 'admin';
const isAuthor = session?.user?.email === item.author;

if (isAdmin && !isAuthor) {
  if (!confirm('관리자 권한으로 타인의 게시글을 삭제합니다. 계속하시겠습니까?')) {
    return;
  }
}
```

### 잘못된 패턴: 서버 확인 후 재요청

API에서 400 에러로 확인을 요청하고 재요청하는 방식은 비효율적입니다:

**문제점:**
- 불필요한 네트워크 왕복 (2번 요청)
- API 멱등성 위반
- UX 저하

**올바른 방법:**
클라이언트에서 먼저 확인 후 1번만 요청

---

## JWT와 Role 데이터 흐름

### 데이터 흐름 다이어그램

```
1. 로그인 시작 (authorize 함수 실행)
   ↓
2. DB에서 user 조회 (user_cred 컬렉션)
   { email, password, name, role: 'admin' }
   ↓
3. jwt callback 실행
   token.user.role = user.role || 'user'
   ↓
4. JWT 토큰 생성 (role 포함)
   ↓
5. session callback 실행
   session.user = token.user
   ↓
6. 클라이언트에서 useSession() 또는 서버에서 getServerSession() 사용 가능
```

### 중요한 포인트

모든 단계가 연결되어 있어야 role이 작동합니다:

| 단계 | 역할 | 누락 시 |
|------|------|---------|
| DB | `user.role` 저장 | undefined |
| JWT callback | `token.user.role = user.role` | undefined |
| Session callback | `session.user.role = token.user.role` | undefined |
| 사용 | `session.user.role` 접근 | undefined |

**하나라도 빠지면 role 기능이 작동하지 않습니다.**

---

## SessionProvider와 useSession

### getServerSession vs useSession

| | `getServerSession` | `useSession()` |
|---|---|---|
| **사용 위치** | 서버 컴포넌트, API 라우트 | 클라이언트 컴포넌트 |
| **컴포넌트 타입** | Server Component | `'use client'` |
| **반환 방식** | async/await 필요 | hook (즉시 반환) |
| **Provider 필요** | 불필요 | `SessionProvider` 필수 |

### SessionProvider 설정

#### 1단계: SessionProvider 컴포넌트 생성

`app/SessionProvider.js`:

```javascript
'use client';

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

export default function SessionProvider({ children, session }) {
  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  );
}
```

#### 2단계: layout.js에 적용

```javascript
import { getServerSession } from "next-auth";
import SessionProvider from "./SessionProvider";

export default async function RootLayout({ children }) {
  let session = await getServerSession(authOptions)

  return (
    <html lang="ko">
      <body>
        <SessionProvider session={session}>
          {/* 네비게이션 바 */}
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
```

#### 3단계: 클라이언트 컴포넌트에서 사용

```javascript
'use client';
import { useSession } from "next-auth/react";

export default function ListItem(props) {
  const { data: session } = useSession();

  // session.user.role 사용 가능
}
```

### SessionProvider는 JWT/Database Session 무관

SessionProvider는 내부 세션 저장 방식(JWT/Database)과 무관하게 클라이언트에서 세션 Context를 제공하는 역할만 합니다.
