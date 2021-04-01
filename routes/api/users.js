const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const keys = require("../../config/key");

const validateRegister = require("../../validation/register");
const validateLogin = require("../../validation/login");

//loading the user module
const User = require("../../models/user");

router.post("/register", (req, res) => {
  //form validataion use hudai xaa hai aba
  const { errors, isValid } = validateRegister(req.body);
  //check vaidation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email }).then((user) => {
    if (user) {
      return res
        .status(400)
        .json({ email: "Account already created with this email" });
    } else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      });

      console.log(req.body.password);
      //hasing password before saving to the database...
      //   bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, 10, async (err, hash) => {
        if (err) throw err;
        console.log("i am here", err);
        newUser.password = hash;
        await newUser.save();
        console.log(req.body);
        res.json(newUser);
        //   .then((user) => res.json(user))
        //   .catch((err) => console.log(err));
      });
      //   });
    }
  });
});

router.post("/login", (req, res) => {
  //form validation
  const { errors, isValid } = validateLogin(req.body);

  //checking validtn
  if (!isValid) {
    res.status(400).json(errors);
  }
  const email = req.body.email;
  const password = req.body.password;

  //find user by email
  User.findOne({ email }).then((user) => {
    //checking if user exist or not
    if (!user) {
      return res.status(404).json({ emailnotfound: "Email not found" });
    }

    //checcking password
    bcrypt.compare(password, user.password).then((isMatch) => {
      if (isMatch) {
        //user exists password is true
        //create jwt payload
        const payload = {
          id: user.id,
          name: user.name,
        };

        //sign token
        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 60 * 60 * 24 * 365 },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token,
            });
          }
        );
      } else {
        return res
          .status(400)
          .json({ passwordincorrect: "Password incorrect" });
      }
    });
  });
});

module.exports = router;
