import { connectDB } from "@/util/database.js"
import ListItem from "./ListItem";

export default async function List() {
  const db = (await connectDB).db('forum');
  const result = await db.collection('post').find().toArray();

  const plainResult = result.map(item => ({
    ...item,
    _id: item._id.toString(),
  }));


  return (
    <div className="list-bg">
      <ListItem result={plainResult}/>
    </div>
  )
}
