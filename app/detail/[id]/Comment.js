'use client';

import { useEffect, useState } from "react";

export default function Comment(props) {
  const postId = props.postId;
  let [comment, setComment] = useState('')
  let [comments, setComments] = useState([])

  // useEffect
  // 특징 1: html 로드/재렌더링 될 때마다 실행
  // 특징 2: 두번째 인자(배열)가 비어있으면 최초 1회만 실행
  // 특징 3: return의 html 보여준 후에 늦게 실행됨
  // why? (ajax 요청완료 후에 보여줘야 하는거 아닌가?) => 사용자 경험 향상 위해서
  // 동작 순서: 1. html 렌더링 -> 2. useEffect 실행 -> 3. ajax 완료 시점에 state 변경 -> 4. 재렌더링
  useEffect(()=>{
    fetch(`/api/post/${postId}/comment`, { method:'GET' })
    .then(res=>res.json())
    .then(data=>{
      console.log("💬 댓글 데이터: ", data)
      setComments(data)
    })
  },[])

  return (
    <div>
      <h4>댓글영역</h4>
      {
        comments.length > 0
        ? comments.map((comment, i) => (
            <div key={i}>
              <p>{comment.content}</p>
              <p>작성자: {comment._id}</p>
              <button onClick={()=>{
                // Optimistic UI: 즉시 +1 업데이트
                const updatedComments = comments.map((c, idx) =>
                  idx === i ? { ...c, like_count: (c.like_count || 0) + 1 } : c
                );
                setComments(updatedComments);

                // API 요청
                fetch(`/api/like`,{
                  method:'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    type: "comment",
                    _id: comment._id
                  })
                }).then(res => {
                  if(!res.ok) {
                    // 실패 시 롤백 (원래 상태로)
                    setComments(comments);
                  }
                })
              }}>👍{comment.like_count || 0}</button>
            </div>
          ))
        : <p>댓글이 없습니다.</p>
      }
      <div>
        <input onChange={(e)=>{ setComment(e.target.value) }} />
        <button onClick={()=>{
          fetch(`/api/post/${postId}/comment`,{ method:'POST', body:comment })
          .then(res=>res.json())
          .then(data=>{
            console.log("💬 댓글 등록 결과: ", data)
            alert('댓글이 등록되었습니다. 새로고침 해주세요.')
            const newComments = [...comments, data.comment];
            setComments(newComments);
          })
        }}>등록</button>
      </div>
    </div>
  );
   }

