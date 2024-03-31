const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const POST=mongoose.model("POST")
const USER = mongoose.model("USER")
const requireLogin = require('../middlewares/requireLogin');

// to get user information n his posts through id 
router.get("/user/:id", async (req, res) => {
    try {
      const user = await USER.findOne({ _id: req.params.id }).select("-password");
      const post = await POST.find({ postedBy: req.params.id })
        .populate("postedBy", "_id")
        .populate("comments.postedBy", "name")
      res.status(200).json({ user, post });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  

// to follow 
router.put("/follow", requireLogin, async (req, res) => {
  try {
    const updatedUser = await USER.findByIdAndUpdate(
      req.body.followId,
      { $push: { followers: req.user._id } },
      { new: true }
    );

    await USER.findByIdAndUpdate(
      req.user._id,
      { $push: { following: req.body.followId } },
      { new: true }
    );

    res.json(updatedUser);
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
});

// to unfollow 
router.put("/unfollow", requireLogin, async (req, res) => {
  try {
    const updatedUser = await USER.findByIdAndUpdate(
      req.body.followId,
      { $pull: { followers: req.user._id } },
      { new: true }
    );

    await USER.findByIdAndUpdate(
      req.user._id,
      { $pull: { following: req.body.followId } },
      { new: true }
    );

    res.json(updatedUser);
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
});




//to upload profile pic
router.put("/uploadProfilePic", requireLogin, async (req, res) => {
  try {
    const updatedUser = await USER.findByIdAndUpdate(
      req.user._id,
      { $set: { Photo: req.body.pic } },
      { new: true }
    );

    res.json(updatedUser);
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
});


module.exports = router;