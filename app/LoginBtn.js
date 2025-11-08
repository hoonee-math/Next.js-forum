'use client'

import { signIn } from 'next-auth/react'

// 컴포넌트를 다른곳에서도 자주 사용할것 같으면 app폴더 바깥 루트 폴더에서 관리.
export default function LoginBtn() {
  return (
    <button onClick={()=>{signIn()}}>로그인</button>
  )
}
