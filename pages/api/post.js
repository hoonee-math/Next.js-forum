import { connectDB } from "@/util/database";

export default function handler(req, res) {
  if (req.method === 'POST') {
    const data = req.body;
    connectDB.then((db) => {
      const dbo = db.db("forum");
      dbo.collection("post").insertOne(data);
      res.status(200).json('POST 요청 성공');
    });

  }
}

