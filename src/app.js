 import express, { urlencoded } from 'express'
 import cors from 'cors'
 import cookieParser from 'cookie-parser'
 import { userRouter } from './routers/user.router.js'
console.log('hello')
 const app=express()

 app.use(express.json())
 app.use(cors())

//  app.use(cors({
//      origin: process.env.CORS_ORIGIN,
//      credentials:true
//  }))

 app.use(cookieParser())
 app.use(express.urlencoded({extended:true,limit:'16kb'}))
app.use(express.static('public'))


app.use('/api/v1/user',userRouter)
 




export {app}