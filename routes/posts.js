var express = require('express');
var router = express.Router();
var mongo = require('mongodb');

var db = require('monk')('localhost:27017/nodeblog');
var multer = require('multer');
var upload = multer({dest:'./public/images/Uploads'});

router.get('/add',function(req,res,next){
  var categories = db.get('categories');
  categories.find({},function(err,categories){
    res.render('addpost',{
      "title": "Add Post",
      "categories": categories
    })
  });

});
router.get('/show/id/:post', function(req,res, next){
  var posts = db.get('posts');
  posts.findOne({_id:req.params.post},{},function(err,post){
    if (post){
      console.log(post);
      res.render('show',{
        'post' : post
      });
    }

  });

});


router.post('/addcomment',function(req,res,next){
  //get  form values
  var name = req.body.name;
  var email = req.body.email;
  var body = req.body.body;
  var postid = req.body.postid;
  var commentdate = new Date();



  // Form Validatin
  req.checkBody('name','This field is required').notEmpty();
  req.checkBody('email','This field is required').notEmpty();
  req.checkBody('email','Email is not formatted correctly').isEmail();
  req.checkBody('body', 'Body field is required').notEmpty();

  var errors = req.validationErrors();

  if(errors){
    var post = db.get('posts');
    posts.findById(postid,function(err,post){
      res.render('show',{
        "errors": errors,
        "post": post,
      });
    });

  } else {
    var comment = {"name":name, "email": email, "body":body, "commentdate":commentdate};

    var posts = db.get('posts');
    posts.update({
      "_id" : postid
    },
    {
      $push:{
        "comments":comment
      }
    },
      function(err, doc){
        if(err) {
          throw err;
        }
        else {
          req.flash('success','Comment Added');
          res.location('/posts/show/id/'+postid);
          res.redirect('/posts/show/id/'+postid);
        }
      }
    );


  }
});



router.post('/add',upload.single('mainimage'),function(req,res,next){
  //get  form values
  var title = req.body.title;
  var category = req.body.category;
  var body = req.body.body;
  var author = req.body.author;
  var date = new Date();

  if(req.file){
    console.log('Uploading file');
    console.log(req.file);
    //File Info
    var mainImageOriginalName = req.file.originalname;
    var mainImageName = req.file.filename;
    var mainImageMime = req.file.mymetype;
    var mainImagePath = req.file.path;
    var mainImageExt = req.file.extension;
    var mainImageSize = req.file.size;

  } else {
    var mainImageName = 'noimage.png'
  }

  // Form Validatin
  req.checkBody('title','This field is required').notEmpty();
  req.checkBody('body', 'Body field is required').notEmpty();

  var errors = req.validationErrors();

  if(errors){
    res.render('addpost',{
      "errors": errors,
      "title": title,
      "body": body
    })
  } else {
    var posts = db.get('posts')

    // Sumbit to db
    posts.insert({
      "title": title,
      "body": body,
      "category": category,
      "date": date,
      "author": author,
      "mainimage": mainImageName
    },function(err,post){
      if(err){
        res.send('There was an issue submitting post');
      }
      else {
        req.flash('success', 'Post Submitted');
        res.location('/');
        res.redirect('/')
      }
    });
  }
});


module.exports = router;
