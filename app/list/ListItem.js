'use client';

import Link from "next/link";
import DetailLink from "./DetailLink";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

export default function ListItem(props) {
  const { data: session } = useSession();
  return (
    <div>
      {
        props.result.map((item,i) =>
          <div className="list-item" key={i}>
            <Link href={'/detail/' + item._id}><h4>{item.title}</h4></Link>
            <Link href={'/edit/' + item._id}> ✏️ </Link>
            {/* form 태그 말고도 서버에 Http 요청 보내는 방법: Ajax */}
            <span onClick={(e)=>{
              // 관리자가 타인의 게시글을 삭제하려는 경우 확인
              const isAdmin = session?.user?.role === 'admin';
              const isAuthor = session?.user?.email === item.author;

              if (isAdmin && !isAuthor) {
                if (!confirm('관리자 권한으로 타인의 게시글을 삭제합니다. 계속하시겠습니까?')) {
                  return; // 취소하면 요청 안 보냄
                }
              }

              fetch('/api/post/delete',{ method: 'DELETE', body: item._id })
                .then(res => {
                  return res.json().then(data => {
                    if (!res.ok) {
                      throw new Error(res.status +' '+ data.message);
                    }
                    return data;
                  })
                })
                .then(data => {
                  console.log(data.message);
                  alert(data.message);
                  e.target.parentElement.style.opacity = 0;
                  setTimeout(()=>{
                    e.target.parentElement.style.display = 'none';
                  },1000)
                })
                .catch(err => {
                  alert("오류 발생 : "+err.message)
                })
              // fetch('/api/test?name=choi&age=20')
              // fetch('/api/test2/메롱')
            }}>🗑️</span>
            <p>{item.content}</p>
            <DetailLink />
          </div>
        )
      }
    </div>
  )
}
