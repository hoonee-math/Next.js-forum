'use client'

import { usePathname, useRouter, useSearchParams } from "next/navigation"; // next/router 가 아니라 next/navigation 임에 주의!

export default function DetailLink() {
  let router = useRouter() // client component 에서만 사용 가능, server component 에서는 사용하기 위해서는 지금같이 컴포넌트를 만들어서 server component 에서 불러와야 함
  let pathName = usePathname() // 현재 경로를 알 수 있음
  let params = useSearchParams() // 쿼리스트링 정보를 알 수 있음

  return (
    <div>
      <button onClick={() => { router.push('/')}} >버튼</button>
      <button onClick={() => { router.back()}} >이전페이지</button>
      <button onClick={() => { router.forward()}} >다음페이지</button>
      <button onClick={() => { router.refresh()}} >soft refresh</button>

      {/* prefetch 기능은 Link 태그만 써도 충분함 */}
      <button onClick={() => { router.prefetch('/detail/abc')}} >페이지 로드에 필요한 모든 파일 미리로드</button>
    </div>
  )
}
