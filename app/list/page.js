import { connectDB } from "@/util/database.js"

export default async function List() {
  let db = (await connectDB).db('forum');
  let result = await db.collection('post').find().toArray();

  return (
    <div className="list-bg">
      {
        result.map((item,i) =>
          <div className="list-item" key={i}>
            <h4>{item.title}</h4>
            <p>{item.content}</p>
          </div>
        )
      }
    </div>
  )
}
