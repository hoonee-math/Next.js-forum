import { connectDB } from "@/util/database.js"
import Link from "next/link";
import DetailLink from "./DetailLink";

export default async function List() {
  let db = (await connectDB).db('forum');
  let result = await db.collection('post').find().toArray();

  return (
    <div className="list-bg">
      {
        result.map((item,i) =>
          <div className="list-item" key={i}>
            {/* Link 태그에는 prefetch 기능이 이미 내장되어있음.
                게시판과 같이 모든 페이지를 방문할 예정이 아니라면, 모든 Link 들을 미리 로드하는 것이 부담이 될 수 있음.
                prefetch={false} 속성으로 기능을 끌 수 있음, 이건 개발 중에는 확인 못함. */}
            <Link href={'/detail/' + item._id}><h4>{item.title}</h4></Link>
            <Link href={'/edit/' + item._id}><div> ✏️ </div></Link>
            <p>{item.content}</p>
            <DetailLink />
          </div>
        )
      }
    </div>
  )
}
