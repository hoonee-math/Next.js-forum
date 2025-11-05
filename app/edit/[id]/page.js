// app/edit/[id]/page.js
import { connectDB } from "@/util/database.js"
import { ObjectId } from "mongodb";

export default async function Edit(props) {
  console.log("✨ props: ",props); // { params: { id: '2' }, searchParams: {} }
  const db = (await connectDB).db('forum')
  const id = String(props.params.id);
  let result = await db.collection('post').findOne({ _id : new ObjectId(id) });
  console.log("✨ result: ", result);
  
  await db.collection('post').updateOne(
    {수정할게시물정보},
    {$set: {수정할내용}}
  )

  return (
    <div className="p-20">
      <h1>글 수정 페이지</h1>
      <form action="/api/post" method="POST">
        {/* value 속성 */}
        <input name="title" value={result.title}/><br />
        {/* defaultValue 가 Next.js 권장 */}
        <input name="content" defaultValue={result.content}/><br />
        <button type="submit">수정</button>
      </form>
    </div>
  )
}
