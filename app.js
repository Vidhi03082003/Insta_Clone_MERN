const express=require('express');
const app=express();
const port=5000;
const mongoose=require('mongoose')
const cors=require('cors')
app.use(cors())

const {mongoUrl}=require('./keys')

require('./models/model')
require('./models/post')
app.use(express.json())
app.use(require("./routes/auth"))
app.use(require("./routes/createPost"))
app.use(require("./routes/user"))

mongoose.connect(mongoUrl)

mongoose.connection.on("connected",()=>{
    console.log("Server Successfully connected to MongoDB")
})

mongoose.connection.on("error",()=>{
    console.log("Not connected to MongoDB")
})

app.listen(port,()=>{
    console.log("Server is running on port "+port);
})

