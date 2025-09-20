import mongoose from 'mongoose'

console.log(process.env.MONGODB_URL,process.env.PORT)
const connnectDb=async()=>{
   console.log('welcome')
   try{
     const con=mongoose.connect(process.env.MONGODB_URL)
    console.log(con,'connnected ....')
   }catch(e){
    console.error(`Error ${e.message} `)
    process.exit(1)
   }
}

export {connnectDb}