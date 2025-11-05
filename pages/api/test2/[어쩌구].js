export default function handler(req, res) {
  console.log("✨ /api/test2/[어쩌구]", req.query)
  res.status(200).json('처리완료')
}
