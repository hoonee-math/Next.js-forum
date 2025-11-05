import { connectDB } from "@/util/database"
import { ObjectId } from "mongodb"

export default async function handler(req, res) {
  if(req.method === 'DELETE'){
    console.log("✨ req.body: ", req.body)

    try{
      const db = (await connectDB).db('forum')
      let result = await db.collection('post').deleteOne({_id: new ObjectId(req.body)})
      console.log(result) // { acknowledged: true, deletedCount: 1 }
      // result 의 deletedCount 값이 0 인 경우 삭제 실패 메시지 출력

      if (result.deletedCount === 0) {
        // ✅ 삭제 실패 시
        return res
          .status(404)
          .json({ message: "삭제할 게시글을 찾을 수 없습니다." });
      }

      res.status(200).json({ message: "삭제 완료" })
    } catch {
      res.status(500).json({ message: "서버 내부 오류" })
    }
  }
}
