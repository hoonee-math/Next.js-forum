import { connectDB } from "@/util/database";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    console.log(req.body);
    const data = req.body;
    connectDB.then(async (db) => {
      const dbo = db.db("forum");
      const savedData = await dbo.collection("post").insertOne(data);
      console.log("데이터 저장 완료", savedData);
      // return res.status(200).json('POST 요청 성공');
      return res.status(200).redirect('/detail/'+savedData.insertedId);
    });

  }
}

