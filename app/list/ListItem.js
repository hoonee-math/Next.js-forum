'use client';

import Link from "next/link";
import DetailLink from "./DetailLink";
import { useEffect } from "react";

export default function ListItem(props) { // props를 편하게 사용하기 위한 destructuring 문법도 가능: ({result}) -> { ... props.result => result

  useEffect(() => {
    // 클라이언트 사이드에서 실행되는 코드
    // api 요청을 보내서 데이터를 가져올 수 있습니다.
    // client component 에서는 검색 노출에 유리한 SEO 최적화가 어렵습니다.

    // 따라서 검색엔진 노출이 중요한 경우에는 서버 컴포넌트에서 DB 데이터를 가져온 다음에 props로 넘겨주는 방식을 권장합니다.
  }, []);

  return (
    <div>
      {
        props.result.map((item,i) =>
          <div className="list-item" key={i}>
            <Link href={'/detail/' + item._id}><h4>{item.title}</h4></Link>
            <Link href={'/edit/' + item._id}> ✏️ </Link>
            {/* form 태그 말고도 서버에 Http 요청 보내는 방법: Ajax */}
            <span onClick={()=>{
              fetch('/api/post/delete',{ method: 'DELETE', body: item._id })
                .then(res => res.json())
                .then(data => {
                  console.log(data.message);
                  alert(data.message);
                })
              // 문자나 숫자는 그냥 body에 넣어도 상관 없지만, Array 또는 Object 객체는 JSON.stringify() 로 묶어줘야함.
            }}>🗑️</span>
            <p>{item.content}</p>
            <DetailLink />
          </div>
        )
      }
    </div>
  )
}
