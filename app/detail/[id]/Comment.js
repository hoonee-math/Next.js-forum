'use client';

import { useState } from "react";

export default function Comment(props) {
  const postId = props.postId;
  let [comment, setComment] = useState('')
  return (
    <div>
      <h4>댓글영역</h4>
      <div>
        <input onChange={(e)=>{ setComment(e.target.value) }} />
        <button onClick={()=>{
          fetch(`/api/post/${postId}/comment`,{ method:'POST', body:comment })
        }}>등록</button>
      </div>
    </div>
  );
}

