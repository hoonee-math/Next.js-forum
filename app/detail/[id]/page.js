// detail/[id]/page.js
import { connectDB } from "@/util/database.js"
import { ObjectId } from "mongodb"
import Comment from "@/app/detail/[id]/Comment.js"

export default async function Detail(props) {
  console.log("==== props: ",props); // { params: { id: '2' }, searchParams: {} }
  const id = String(props.params.id);

  const db = (await connectDB).db('forum');
  let result = await db.collection('post').findOne({ _id : new ObjectId(id) });

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
