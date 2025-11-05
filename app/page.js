import { connectDB } from "@/util/database"

export default async function Home() {

  // // 아런 코드들은 server component에만 작성하는 것이 좋다!
  // const client = await connectDB
  // const db = client.db("forum")
  // let result = await db.collection("post").find().toArray()

  // // sever component 이기 때문에 터미널에 콘솔 메시지가 뜸
  // console.log("----- result -----")
  // console.log(result)

  return (
    <div>
        안녕
    </div>
  );
}
