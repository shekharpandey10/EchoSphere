import './config/config.js'
import { connnectDb } from "./Db/db.js";
import { app } from "./app.js";



connnectDb()
.then(()=>{
    console.log('started.....')
    app.on('error',(error)=>{
        console.log('Express Server Error')
    })

    app.listen(process.env.PORT,()=>{
        console.log('Server is running at PORT',process.env.PORT)
    })
}).catch((e)=>{
    console.error('Error is',e.message)
    process.exit(1)
})
