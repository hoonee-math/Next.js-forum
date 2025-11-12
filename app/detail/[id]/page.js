// detail/[id]/page.js
import { connectDB } from "@/util/database.js"
import { ObjectId } from "mongodb"
import Comment from "@/app/detail/[id]/Comment.js"
import { notFound } from "next/navigation";

export default async function Detail(props) {
  console.log("==== props: ",props); // { params: { id: '2' }, searchParams: {} }
  const id = String(props.params.id);

  // ObjectId 유효성 검사
  if (!ObjectId.isValid(id)) {
    return notFound();
  }

  const db = (await connectDB).db('forum');
  let result = await db.collection('post').findOne({ _id : new ObjectId(id) });

  // Not Found 처리 (방법 1)
  if (result===null) { // result가 null이면(존재하지 않는 id면)
    // return <div>404 존재하지 않는 게시물입니다.</div>
    return notFound(); // Not Found 처리 (방법 2): next/navigation의 notFound() 함수 사용, not-found.js 컴포넌트 호출됨
  }

  console.log("result: ", result);

  // 런타임 에러 테스트용
  // throw new Error('테스트 에러 발생!');

  return (
    <div>
      <h4>상세페이지</h4>
      <h5>{result.title}</h5>
      {/* <h5>{result.title.error.이런건없음}</h5> */}
      <p>{result.content}</p>
      <Comment postId={id}/>
    </div>
  );
}
