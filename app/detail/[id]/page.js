// detail/[id]/page.js
import { connectDB } from "@/util/database.js"
import { ObjectId } from "mongodb"

export default async function Detail(props) {
  console.log("==== props: ",props); // { params: { id: '2' }, searchParams: {} }
  const id = String(props.params.id);

  let db = (await connectDB).db('forum');
  let result = await db.collection('post').findOne({ _id : new ObjectId(id) });

  console.log("result: ", result);

  return (
    <div>
      <h4>상세페이지</h4>
      <h5>{result.title}</h5>
      <p>{result.content}</p>
    </div>
  );
}
