const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const USER = mongoose.model("USER")
const jwt=require('jsonwebtoken')
const {Jwt_secret}=require('../keys.js');
const requireLogin = require('../middlewares/requireLogin.js');

router.get('/', (req, res) => {
  res.send("Hello")
})




router.post('/signup', (req, res) => {
  //  res.send("data posted successfully")
  //  console.log(req.body.name)
  const { name, userName, email, password } = req.body;
  if (!name || !email || !userName || !password) {
    return res.status(422).json({ error: "Please add all the fields." })
  }

  USER.findOne({ $or: [{ email: email }, { userName: userName }] }).then((savedUser) => {
    if (savedUser) {
      return res.status(422).json({ error: "User already exists with that email or username" })
    }
    bcrypt.hash(password, 12).then((hashedPassword) => {
      const user = new USER({
        name, email, userName, password: hashedPassword
      })

      user.save()
        .then(user => { res.json({ message: "Registered Successfully" }) })
        .catch(err => { console.log(err) })
    })
  })
})



router.post('/signin', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).json({ error: "Please add both email and password." })
  }

  USER.findOne({email:email}).then((savedUser) => {
    if(!savedUser){
      return res.status(422).json({ error: "Invalid Email." })
    }
    bcrypt.compare(password,savedUser.password).then((match)=>{
      if(match){
        // return res.status(200).json({message:"Signed In Successfully"})
        const token=jwt.sign({_id:savedUser.id},Jwt_secret)
        const {_id,name,email,userName,Photo}=savedUser
        return res.status(200).json({ token,user:{_id,name,email,userName,Photo} });
      }
      else{
        return res.status(422).json({message:"Invalid Password"})
      }
    }).catch(err=>console.log(err))
  })
})



router.post("/googleLogin",(req,res)=>{
  const {email_verified,email,name,clientId,userName,Photo}=req.body
  
  if(email_verified){
    USER.findOne({email:email}).then((savedUser) => {
      if(savedUser){
        const token=jwt.sign({_id:savedUser.id},Jwt_secret)
        const {_id,name,email,userName}=savedUser
        return res.status(200).json({ token,user:{_id,name,email,userName} });
      }
      else{
        const password=email+clientId
        const user = new USER({
          name, email, userName, password,Photo
        }) 
        user.save()
          .then(user => { 
            let userId=user._id.toString()
            const token=jwt.sign({_id:userId},Jwt_secret)
            const {_id,name,email,userName}=user
            return res.status(200).json({ token,user:{_id,name,email,userName} });
           })
          .catch(err => { console.log(err) })
      }
    })
  }
})

module.exports = router;