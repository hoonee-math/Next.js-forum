import { connectDB } from "@/util/database.js"
import Link from "next/link";

export default async function List() {
  let db = (await connectDB).db('forum');
  let result = await db.collection('post').find().toArray();

  return (
    <div className="list-bg">
      {
        result.map((item,i) =>
          <div className="list-item" key={i}>
            <Link href={'/detail/' + item._id}><h4>{item.title}</h4></Link>
            <p>{item.content}</p>
          </div>
        )
      }
    </div>
  )
}
