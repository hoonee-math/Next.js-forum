import { connectDB } from "@/util/database.js"
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  const db = (await connectDB).db('forum');
  const session = await getServerSession(req, res, authOptions);
  console.log("🪪 session: ", session)

  if(req.method === 'POST'){
    console.log("✨ /api/like API POST 요청 들어옴 ✨");
    console.log("✨ req.body: ", req.body);
    try{
      if (!session) return res.status(401).json({ message: '로그인이 필요합니다.' });

      const data = {
        targetType : req.body.type, // 'post' || 'comment'
        targetId : req.body._id,
        email : session.user.email
      }
      
      // data를 저장
      await db.collection("likes").insertOne(data);

      await db.collection(req.body.type).updateOne(
        { _id: new ObjectId(req.body._id) },
        { $inc: { like_count: 1 } }
      );

      res.status(200).json({ message: 'liked' });
    } catch(e) {
      // 중복 에러 = 이미 좋아요 누른 상태
      if (e.code === 11000) {
        return res.status(409).json({ message: 'already liked' });
      }
      throw e; // 다른 DB 에러는 서버 오류
    }
  }
}
