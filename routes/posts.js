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
