'use client'
/*
## 에러페이지 만들려면
1. 파일명: error.js
2. export default function Error(props) {} // client 컴포넌트여야 함
3. props로 error, reset 함수 전달됨
   - error: 발생한 에러 객체
   - reset: 에러 복구 시도 함수
*/
export default function Error({ error, reset }) {
  return (
    <div>
      <h4>에러발생!</h4>
      <p>페이지를 표시하는 중에 에러가 발생했습니다.</p>
      <pre>{console.log("❌",error)}</pre>
      <button onClick={() => reset()}>다시시도</button>
    </div>
  )
}

/*
## 부분만 에러처리 됨
- 특정 경로에 error.js 파일을 만들면, 해당 경로와 그 하위 컴포넌트 영역에서만 에러처리가 됨
- 예: detail/[id]/error.js 파일을 만들면, detail/[id]/page.js 및 그 하위 컴포넌트에서만 에러처리가 됨
- 상위 경로(예: detail/error.js 또는 app/error.js)에서는 이 error.js가 적용되지 않음

## 전체 페이지 에러처리
- 전체 페이지에서 에러처리를 하려면, app/error.js 파일을 만들어야 함
- page.js 와 같은 폴더의 error.js 를 먼저 찾기 때문
- error.js 가 없으면 상위 폴더로 올라가면서 error.js 를 찾음
*/
