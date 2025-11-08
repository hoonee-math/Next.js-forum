import { connectDB } from "@/util/database";
import bcrypt from "bcrypt";

export default async function handler(req, res) {
  if(req.method == 'POST') {
    if(!(req.body.name && req.body.email && req.body.password)) {
      res.status(302).setHeader('Location', `/register?error=${encodeURIComponent('모든 값을 입력해주세요')}`)
      return res.end()
    }

    let db = (await connectDB).db('forum')

    let user = await db.collection('user_cred').findOne({email : req.body.email})
    if (user) {
      res.status(302).setHeader('Location', `/register?error=${encodeURIComponent('중복된 이메일 입니다')}`)
      return res.end()
    }

    const hash = await bcrypt.hash(req.body.password, 10)
    req.body.password = hash

    await db.collection('user_cred').insertOne(req.body)

    res.status(302).setHeader('Location', `/login?success=${encodeURIComponent('회원가입에 성공하였습니다')}`)
    return res.end()
  }
}

