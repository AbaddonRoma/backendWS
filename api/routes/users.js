const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const checkAuth = require('../middleware/check-auth');

const User = require('../models/users');

router.post('/signup', (req, res, next) => {
  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({
        error: err
      })
    } else {
      const user = new User({
        _id: new mongoose.Types.ObjectId(),
        username: req.body.username,
        password: hash
      });
      user.save()
        .then(result => {
          console.log(result);
          res.status(201).json({
            message: 'User succesfully created'
          })
        })
        .catch(err => {
          console.log(err);
          res.status(500).json({
            error: err
          })
        })
    }
  })
});

router.get('/users', (req, res, next) => {
  User.find()
    .select('_id username')
    .exec()
    .then(users => {
      console.log(users);
      const data = {
        count: users.length,
        users: users.map(user => {
          return {
            _id: user._id,
            username: user.username
          }
        })
      };
      res.status(200).json(data);
    })
    .catch(err => {
      res.status(500).json({
        message: err
      })
    })
});

router.post('/login', (req, res, next) => {
  User.find({username: req.body.username})
    .exec()
    .then(user => {
      if (user.length < 1) {
        return res.status(401).json({
          message: 'Auth failed'
        })
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: 'Auth failed'
          })
        }
        if (result) {
          const token = jwt.sign({
              username: user[0].username,
              userId: user[0].id
            },
            process.env.JWT_KEY,
            {
              expiresIn: "1h"
            }
          );
          return res.status(200).json({
            message: 'Auth success',
            token: token,
            expiresIn: 3600
          })
        }
        res.status(401).json({
          message: 'Auth failed'
        })
      })
    })
    .catch(err => {
      res.status(500).json({
        error: err
      })
    })
});

router.get('/islogged', checkAuth, (req, res, next) => {
  res.status(200).json({
    response: 'loggedIn',
    user: req.userData
  })
});

module.exports = router;