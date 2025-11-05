// detail/[어쩌구]/page.js
import { connectDB } from "@/util/database.js"

export default async function Detail() {
  let db = (await connectDB).db('forum');
  let result = await db.collection('post').findOne({ _id : props.params.id });
  console.log("result: ", result);

  return (
    <div>
      <h4>상세페이지</h4>
      <h4>글제목</h4>
      <p>글내용</p>
    </div>
  );
}
