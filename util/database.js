import { MongoClient } from 'mongodb'
const url = process.env.MONGODB_URL
const options = { useNewUrlParser: true }
let connectDB

// 개발 환경에서만 전역 변수를 사용하여 연결을 재사용합니다.
if (process.env.NODE_ENV === 'development') {
  if (!global._mongo) {
    global._mongo = new MongoClient(url, options).connect()
  }
  connectDB = global._mongo
} else {
  // 프로덕션 환경에서는 전역 변수를 사용하지 않습니다. (사실 이 코드만 있어도 db 연결은 재사용됩니다.)
  connectDB = new MongoClient(url, options).connect()
}
export { connectDB }
