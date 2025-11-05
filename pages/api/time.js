export default function handler(req, res) {
  let time = new Date();

  res.status(200).json(time.toString());
}
