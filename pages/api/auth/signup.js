import { connectDB } from "@/util/database";
import bcrypt from "bcrypt";

export default async function handler(req, res) {
  if(req.method == 'POST') {
    const hash = await bcrypt.hash(req.body.password, 10)
    req.body.password = hash

    let db = (await connectDB).db('forum')
    await db.collection('user_cred').insertOne(req.body)

    return res.status(200).json('회원가입에 성공하였습니다.')
  }
}

