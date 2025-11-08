import { connectDB } from "@/util/database";

export default async function handler(req, res) {
  if(req.method == 'POST') {
    let db = (await connectDB).db('forum')
    await db.collection('user_card').insertOne(req.body)
  }

}
