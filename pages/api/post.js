import { connectDB } from "@/util/database";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    console.log(req.body);

    if(req.body.title === '' || req.body.content === ''){
      return res.status(400).json('제목과 내용을 모두 입력해주세요.');
    }

    try {
      const db = (await connectDB).db("forum");
      let savedData = await db.collection("post").insertOne(req.body);
      return res.status(200).redirect('/detail/'+savedData.insertedId);
      
    } catch (error) {
      return res.status(500).json('서버 오류로 인해 데이터를 저장할 수 없습니다.');
    }

  }
}

