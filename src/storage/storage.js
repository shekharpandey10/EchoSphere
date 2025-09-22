import {Storage} from '@google-cloud/storage'

const storage =new Storage({
    projectId:process.env.PROJECT_ID,
    KeyFileName:process.env.GOOGLE_APPLICATION_CREDENTIALS
})

const bucketName=process.env.BUCKET_NAME
export const bucket=storage.bucket(bucketName)