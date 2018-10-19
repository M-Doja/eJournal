const config = require('../lib');
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Entry = require('../models/Entry');
const Mid = require('../middleware');
const RM = require('./routeMethods');
const cloudinary = require('cloudinary');
const multer= require('multer');
const storage = multer.diskStorage({
  filename: function(req, file, cb){
    cb(null, Date.now() + file.originalname);
  }
});
const imageFilter = function(req, file, cb){
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error('Only images files are allowed'), false);
  }
  cb(null, true);
}
const upload = multer({
  storage: storage,
  fileFilter: imageFilter
});

cloudinary.config({
    cloud_name: config.Cloud_Name,
    api_key: config.Cloud_Api_Key,
    api_secret: config.Cloud_Api_Secret
});

router.post('/new/:id', Mid.isLoggedIn, upload.single('image'),(req, res, next) => {
  cloudinary.uploader.upload(req.file.path, function(result) {
    req.body.image = result.secure_url;
    User.findById({'_id': req.params.id}, function(err, user){
      if (err) {
        res.send(err);
      }
      const name = user.username;
      user.avatar = req.body.image;
      user.save(function(err, user){
        if (err) {
          res.send(err)
        }
        res.redirect(`/${user.username}`)
      })
    })
  });
});

module.exports = router;
