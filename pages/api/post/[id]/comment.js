import { connectDB } from "@/util/database";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(req, res) {

  if(req.method === 'POST'){
    console.log("📢 /api/post/{id}/comment API POST 요청 들어옴 ✨");
    const postId = req.query.id;

    try{
      const session = await getServerSession(req, res, authOptions);
      if (!session) return res.status(401).json({ message: '로그인이 필요합니다.' });

      let requestData = { content: req.body, author:session.user.email , parent: new ObjectId(postId) }

      const db = (await connectDB).db('forum');
      let result = await db.collection('comment').insertOne( requestData );

      let responseData = { _id: result.insertedId, ...requestData };

      res.status(200).json({ message: "댓글 등록 완료", comment: responseData })
    } catch {
      res.status(500).json({ message: "서버 내부 오류" })
    }
  }

  if(req.method === 'GET'){
    console.log("📢 /api/post/{id}/comment API GET 요청 들어옴 ✨");
    const postId = req.query.id;

    try{
      const db = (await connectDB).db('forum');
      let comments = await db.collection('comment').find( { parent: new ObjectId(postId) } ).toArray();

      res.status(200).json(comments)
    } catch {
      res.status(500).json({ message: "서버 내부 오류" })
    }
  }
}
