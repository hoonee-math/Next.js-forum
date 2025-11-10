'use client';

export default function Comment() {
  return (
    <div>
      <h4>댓글영역</h4>
      {/* form 태그를 이용하면 새로고침이 되기 때문에 ajax를 이용해보자 */}
      {/* <form>
        <input type="text" placeholder="댓글작성" />
        <button type="submit">등록</button>
      </form> */}
      <div>
        <input type="text" placeholder="댓글작성" />
        <button type="button">등록</button>
      </div>
    </div>
  );
}

