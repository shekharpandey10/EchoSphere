 import express, { urlencoded } from 'express'
 import cors from 'cors'
 import cookieParser from 'cookie-parser'
console.log('hello')
 const app=express()

 app.use(express.json())

 app.use(cors({
     origin: process.env.CORS_ORIGIN,
     credentials:true
 }))

 app.use(cookieParser())
 app.use(express.urlencoded({extended:true,limit:'16kb'}))
app.use(express.static('public'))
 




export {app}