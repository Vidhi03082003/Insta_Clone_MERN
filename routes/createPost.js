const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const POST=mongoose.model("POST")



router.get('/allposts',requireLogin,(req,res)=>{
    
    POST.find()
    .populate("postedBy","_id name Photo")
    .populate("comments.postedBy","_id name")
    .sort("-createdAt")
        .then(posts=>res.json(posts))
        .catch(err=>console.log(err))
})



router.post('/createPost',requireLogin, (req, res) => {
    const {body,pic}=req.body;
    if(!pic || !body){
        return res.status(422).json({error:"Please add all the fields"})
    }
    console.log(req.user)
    const post=new POST({
        body,
        photo:pic,
        postedBy:req.user
    })
    post.save().then((result)=>{
        return res.json({post:result})
    }).catch(err=>console.log(err))
  })



  router.get('/myposts',requireLogin,(req,res)=>{
    POST.find({postedBy:req.user._id})
    .populate("postedBy","_id name")
    .populate("comments.postedBy","_id name")
    .sort("-createdAt")
        .then(myposts=>res.json(myposts))
        .catch(err=>console.log(err))
})



router.put("/like", requireLogin, (req, res) => {
    POST.findByIdAndUpdate(req.body.postId, {
        $push: { likes: req.user._id }
    }, {
        new: true
    })
    .populate("postedBy","_id name Photo")
    .then(result => {
        res.json(result);
    })
    .catch(err => {
        res.status(422).json({ error: err });
    });
});




router.put("/unlike", requireLogin, (req, res) => {
    POST.findByIdAndUpdate(req.body.postId, {
        $pull: { likes: req.user._id }
    }, {
        new: true
    })
    .populate("postedBy","_id name Photo")
    .then(result => {
        res.json(result);
    })
    .catch(err => {
        res.status(422).json({ error: err });
    });
});


router.put("/comment", requireLogin, (req, res) => {
    const comment={
        text:req.body.text,
        postedBy:req.user._id
    }
    POST.findByIdAndUpdate(req.body.postId, {
        $push: { comments: comment }
    }, {
        new: true
    })
    .populate("comments.postedBy","_id name")
    .populate("postedBy","_id name")
    .then(result => {
        res.json(result);
    })
    .catch(err => {
        res.status(422).json({ error: err });
    });
});






router.delete("/deletePost/:postId", requireLogin, async (req, res) => {
    try {
       // console.log(req.params.postId);
        const post = await POST.findOne({ _id: req.params.postId }).populate("postedBy", "_id");
        if (!post) {
            return res.status(422).json({ error: "Post not found" });
        }
        if (post.postedBy._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Unauthorized to delete this post" });
        }
        await post.deleteOne();
        return res.json({ message: "Successfully Deleted" });
    } catch (err) {
        return res.status(422).json({ error: err.message });
    }
});



// to show my following posts
router.get("/myfollowingpost",requireLogin,(req,res)=>{
    POST.find({postedBy:{$in:req.user.following}})
        .populate("postedBy","_id name")
        .populate("comments.postedBy","_id name")
        .then(posts=>{
            res.json(posts)
        })
        .catch(err=>{console.log(err)})
})




module.exports=router
  