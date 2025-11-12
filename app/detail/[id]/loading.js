
export default function Loading() {
  return (
    <div>
      <h4>page.js</h4>
      <p>로딩중...</p>
    </div>
  )
}

// React의 Suspense와 유사한 역할을 하는 컴포넌트
// 페이지가 로드되는 동안 사용자에게 피드백을 제공
// 주로 데이터 페칭이나 컴포넌트 로딩이 오래 걸릴 때 사용
// Next.js는 이 파일을 자동으로 인식하여 해당 경로의 페이지가 로드되는 동안 이 로딩 컴포넌트를 표시
/*
```
<Suspense fallback={<div>로딩중...</div>}>
  <div>보여줄 페이지</div>
</Suspense>
```
*/

// 현재 상황에서 comment.js의 useEffect가 실행되어도 loading.js가 표시되지 않는 이유:
// loading.js는 Next.js의 서버 측 라우팅에서 페이지 전체가 로드될 때만 작동합니다.
// comment.js의 useEffect는 클라이언트 측에서 실행되며, 이는 이미 로드된 페이지 내에서 발생하는 비동기 작업입니다.
// 따라서 useEffect가 실행될 때는 이미 페이지가 로드된 상태이므로 loading.js가 다시 표시되지 않습니다.
