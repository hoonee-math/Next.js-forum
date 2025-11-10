import { connectDB } from "@/util/database";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(req, res) {

  /* 글쓰기 요청시 사용자 정보도 포함시키기
    - 현재 유저 정보를 유저가 직접 보낼 수 있게 하는 것은 위험!
    - getServerSession 이용해서 현재 로그인한 유저 정보를 사용!
    - 서버 기능 안에서 사용할 때는 req, res 도 함께 넣어줘야 함!
  */
  let session = await getServerSession(req, res, authOptions)
  console.log("✨ pages/api/ session: ", session)
  // 사용자 정보는 세션 정보에서 불러와서 담아주고, 안전 장치도 해주자!
  if (session) req.body.author = session.user.email
  else return res.status(401).json('권한이 없거나, 인증 정보가 만료되었습니다.')

  if (req.method === 'POST') {
    console.log("✨ req.body: ", req.body);

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

