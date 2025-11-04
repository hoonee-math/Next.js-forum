import { MongoClient } from "mongodb";

export default async function Home() {

  const client = await MongoClient.connect('mongodb+srv://admin:<password>@cluster-test.xlyfktc.mongodb.net/?appName=Cluster-test', { useNewUrlParser: true });
  const db = client.db("forum");
  const collection = db.collection("posts");

  return (
    <div>
        안녕
    </div>
  );
}
