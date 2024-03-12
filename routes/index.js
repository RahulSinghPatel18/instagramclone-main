var express = require('express');
var router = express.Router();
var usermodel = require("./users")
var postmodel = require("./posts")
const passport = require("passport")
const localstrategy = require("passport-local")
const upload = require("./multer")
const multer = require("multer")
const storymodel  = require("./story")
const maxSize = 100 * 1024 * 1024;
const {storage} = require("../cloudConfig.js")
const uploads = multer({storage})
passport.use(new localstrategy(usermodel.authenticate()))


router.get('/', function(req, res) {
  res.render('index', {footer: false});
});

router.get('/reel', function(req, res) {
  res.render('reel');
});


router.post('/register', function(req, res) {
  const {email,username,name} = req.body;
 var user = new usermodel({
   email,username,name
 })
    // var userdets = new usermodel({
    //   email:req.body.email,
    //   username:req.body.username,
    //   name:req.body.name
    // })

 usermodel.register(user,req.body.password)
 .then(function(userdets){
  passport.authenticate("local")(req,res,function(){
    res.redirect("/profile")
  })
 })
});





router.get('/login', function(req, res) {
  res.render('login', {footer: false});
});

router.post('/login',passport.authenticate("local",{
  successRedirect:"/profile"  ,
  failureRedirect:"/login"
}),function(req,res,next) {})


router.get('/logout',function(req, res, next) {
req.logout(function(err){
if (err){
  return next(err);
}
res.redirect("/")
})
});

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }else{
    res.redirect("/")
  }
}


router.get('/feed',isLoggedIn,async function(req, res) {
  let user = await usermodel.findOne({username:req.session.passport.user})
  let posts = await postmodel.find().populate("user")
  let stories = await  storymodel.find({user:{$ne:user._id}}).populate("user")
  // console.log(stories)
  var obj = {}
  const packs = stories.filter(function(story){
    if(!obj[story.user._id]){
      obj[story.user._id] = "ascbvjanscm";
      return true;
    }
  })

//  let storyies =  stories.filter(function(story){
//        if(!obj[story.user._id]){
//         obj[story.user._id] ="kuchbhi";
//         return true;
//        }
//   })


  res.render('feed', {footer: true, posts: posts,user:user,storys:packs});
});

router.get('/profile',isLoggedIn, async function(req, res) {
  let user = await usermodel
  .findOne({username:req.session.passport.user})
  .populate("posts")
  .populate("saved")
  res.render('profile', {footer: true,user:user});
});

router.get("/story/:number", isLoggedIn, async function (req, res) {
  const storyuser = await usermodel.findOne({ username: req.session.passport.user })
  .populate("stories")

  const image = storyuser.stories[req.params.number];

  if(storyuser.stories.length > req.params.number){
    res.render("story", { footer: false, storyuser: storyuser, storyimage : image, number: req.params.number });
  }
  else{
    res.redirect("/feed");
  }
});

router.get("/story/:id/:number", isLoggedIn, async function (req, res) {
  const storyuser = await usermodel.findOne({ _id: req.params.id })
  .populate("stories")

  const image = storyuser.stories[req.params.number];

  if(storyuser.stories.length > req.params.number){
    res.render("story", { footer: false, storyuser: storyuser, storyimage : image, number: req.params.number });
  }
  else{
    res.redirect("/feed");
  }

});

router.get('/search',isLoggedIn, function(req, res) {
  res.render('search', {footer: true});
});

router.get('/save/:postid',isLoggedIn,async function(req, res) {
  const user = await usermodel.findOne({username:req.session.passport.user})
  const post = await postmodel.findOne({_id: req.params.postid});
if(user.saved.indexOf(post._id) === -1) {
  user.saved.push(req.params.postid);
}else{
  user.saved.splice(user.saved.indexOf(post._id),1)
}
  await user.save();
  res.json(user);
});

router.get('/like/:postid',isLoggedIn,async function(req, res) {
   const post = await postmodel.findOne({_id: req.params.postid});
   const user = await usermodel.findOne({username:req.session.passport.user})

   if(post.likes.indexOf(user._id) === -1) {
    post.likes.push(user._id);
   }else{
    post.likes.splice(post.likes.indexOf(user._id),1);
   }
   await post.save();
   res.json(post);
});
router.get('/edit',isLoggedIn,async function(req, res) {
  let user = await usermodel.findOne({username:req.session.passport.user})
  res.render('edit', {footer: true,user:user});
});

router.post('/uploadprofile',isLoggedIn,upload.single("image"),async function(req, res) {
  let user = await usermodel.findOne({username:req.session.passport.user})
    user.profileimg = req.file.filename;
    await user.save();
    res.redirect("/profile");
  
});


router.post('/updatedets',isLoggedIn,async function(req, res) {
  let users = await usermodel.findOneAndUpdate(
    {username:req.session.passport.user},
    {username:req.body.username,name:req.body.name,bio:req.body.bio},
    {new:true}
    )
   req.login(users,function(err){
    if(err) throw err;
    res.redirect("/profile");
   })
  
});

router.get('/username/:username',isLoggedIn,async function(req, res) {
  const regex = new RegExp(`${req.params.username}`,"i");
  const user = await usermodel.find({username:regex})
  res.json(user)
});

router.get('/upload',isLoggedIn, function(req, res) {
  res.render('upload', {footer: true});
});

router.get('/follow/:userid',isLoggedIn,async function(req, res) {
  const follower = await usermodel.findOne({username:req.session.passport.user})
  const user = await usermodel.findOne({_id: req.params.userid})

  if(user.followers.indexOf(follower._id) === -1) {
    user.followers.push(follower._id)
  }else{
    user.followers.splice(user.followers.indexOf(follower._id),1)
  }

  if(follower.following.indexOf(user._id) === -1){
    follower.following.push(user._id)
  }else{
    follower.following.splice(follower.following.indexOf(user._id),1)
  }
   await follower.save()
   await user.save()
   res.json(user)
});


router.get('/viewprofile/:userid',isLoggedIn,async function(req, res) {
  var user = await usermodel.findOne({_id: req.params.userid}).populate("posts")
  var logedinuser = await usermodel.findOne({username:req.session.passport.user})
  if(logedinuser._id.toString() === user._id.toString()){
    res.redirect("/profile")
  }else if(logedinuser._id.toString() !== user._id.toString()){
    res.render('viewprofile', {footer: true,user,logedinuser});
  }
  
});


router.post('/upload',isLoggedIn,upload.single("file"),async function(req, res) {

  let user = await usermodel.findOne({username:req.session.passport.user})
  if(req.body.type === "post"){
    let post =  await postmodel.create({
      caption:req.body.caption,
      image:req.file.filename,
      user:user._id
    })

    console.log(post);
 user.posts.push(post._id); 

  }

  if(req.body.type === "story"){
    let story =  await storymodel.create({
      caption:req.body.caption,
      image:req.file.filename,
      user:user._id
    })

    user.stories.push(story._id);
  }

 await user.save();
 res.redirect("/feed");

});


module.exports = router;
