export default function Write() {
  return (
    <div>
      <h1>글 작성 페이지</h1>
      <form action="/api/test" method="POST"> {/* GET, POST 만 사용가능 */}
        <button type="submit">완료</button>
      </form>
    </div>
  )
}
