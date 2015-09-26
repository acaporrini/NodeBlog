var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('localhost:27017/nodeblog');

// Homepage Blog Posts
router.get('/add', function(req, res, next) {
  res.render('addcategory',{
    'title' : 'Add Category'
  });
});

router.post('/add',function(req,res,next){
  //get  form values
  var title = req.body.title;

  // Form Validatin
  req.checkBody('title','This field is required').notEmpty();


  var errors = req.validationErrors();

  if(errors){
    res.render('addcategory',{
      "errors": errors,
      "title": title
    })
  } else {
    var categories = db.get('categories')

    // Sumbit to db
    categories.insert({
      "title": title
    },function(err,category){
      if(err){
        res.send('There was an issue submitting the category');
      }
      else {
        req.flash('success', 'Category Submitted');
        res.location('/');
        res.redirect('/')
      }
    });
  }
});
module.exports = router;