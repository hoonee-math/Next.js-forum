import { connectDB } from "@/util/database";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(req, res) {

  if(req.method === 'POST'){
    console.log("📢 /api/post/{id}/comment API POST 요청 들어옴 ✨");
    const postId = req.query.id;
    console.log("📢 req.body: ", req.body);
    console.log("📢 req.query.id: ", postId);

    try{
      const session = await getServerSession(req, res, authOptions);
      if (!session) return res.status(401).json({ message: '로그인이 필요합니다.' });
      console.log("📢 /api/post/{id}/comment session: ", session.user.email );

      const db = (await connectDB).db('forum');
      let result = await db.collection('comment').insertOne( { content: req.body, author:session.user.email ,parent: new ObjectId(postId) } );
      console.log("✔️ 댓글 등록 결과: ", result );
      res.status(200).json({ message: "댓글 등록 완료" })
    } catch {
      res.status(500).json({ message: "서버 내부 오류" })
    }
  }
}
