// app/edit/[id]/page.js
import { connectDB } from "@/util/database.js"
import { ObjectId } from "mongodb";

export default async function Edit(props) {
  console.log("✨ props: ",props); // { params: { id: '2' }, searchParams: {} }
  const db = (await connectDB).db('forum')
  const id = String(props.params.id);
  let result = await db.collection('post').findOne({ _id : new ObjectId(id) });
  console.log("✨ result: ", result);

  return (
    <div className="p-20">
      <h1>글 수정 페이지</h1>
      <form action="/api/post/edit" method="POST">
        {/* value 속성 안먹힘.. */}
        {/* defaultValue 가 Next.js 권장 */}
        <input type="hidden" name="_id" value={id} />
        <input name="title" defaultValue={result.title}/>
        <input name="content" defaultValue={result.content}/>
        <button type="submit">전송</button>
      </form>
    </div>
  )
}
