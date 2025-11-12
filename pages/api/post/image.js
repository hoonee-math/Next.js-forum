// /api/post/image.js

import aws from 'aws-sdk'

export default async function handler(요청, 응답){
  // AWS 라이브러리 사용을 위한 설정
  aws.config.update({
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_KEY,
    region: 'ap-northeast-2',
    signatureVersion: 'v4',
  })

  const s3 = new aws.S3();
  const url = await s3.createPresignedPost({ // Presigned-URL 발급 함수, 자세한 설정은 createPresignedPost 함수 사용법 검색
    Bucket: process.env.BUCKET_NAME,
    Fields: { key : 요청.query.file }, // 사용자가 설정한 파일명
    Expires: 60, // seconds, url 유효기간을 초단위로 설정 가능
    Conditions: [
      ['content-length-range', 0, 1048576], //파일용량 1MB 까지 제한
    ],
  })

  응답.status(200).json(url)
}
