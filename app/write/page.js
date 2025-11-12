'use client'

import { authCheck } from "@/util/authCheck"

export default async function Write() {
  const session = await authCheck()
  console.log("✨/Write/page",session);

  return (
    <div className="p-20">
      <h1>글 작성 페이지</h1>
      <form action="/api/post" method="POST"> {/* GET, POST 만 사용가능 */}
        <input name="title" placeholder="제목" /><br />
        <input name="content" placeholder="내용"></input><br />
        {/* type에 file 설정 가능, 허용 가능한 파일 유형 선택 가능 */}
        <input type="file" accept="image/*"
          onChange={async(e)=>{
            let file = e.target.files[0]; // e.target.files: 선택된 파일 목록
            let filename = encodeURIComponent(file.name) //한글 파일명이 깨질 수 있기 때문에 encodeURIComponent 사용
            let res = await fetch('/api/post/image'+'?file='+filename)
            res = await res.json()
          }}
        />
        <img src=""/>
        <button type="submit">완료</button>
      </form>
    </div>
  )
}
