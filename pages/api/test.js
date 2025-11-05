export default function handler(req, res) {
  if (req.method == 'POST') {
    res.status(405).json('아직 POST 기능이 구현되지 않았습니다.')
    return
  }
  if (req.method == 'GET') {
    console.log(req.query)
    res.status(200).json('처리완료')
    return
  }
}
