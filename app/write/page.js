export default function Write() {
  return (
    <div>
      <h1>글 작성 페이지</h1>
      <form action="/api/post" method="POST"> {/* GET, POST 만 사용가능 */}
        <input name="title" placeholder="제목" /><br />
        <textarea name="content" placeholder="내용"></textarea><br />
        <button type="submit">완료</button>
      </form>
    </div>
  )
}
