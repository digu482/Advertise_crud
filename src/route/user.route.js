const express = require('express')
const router = express.Router()
const User = require("../model/user");
const controller = require("../controller/user.controller")
const {userverifyToken} = require("../middleware/Auth");


router.post("/create",controller.create)

router.get("/finduser",userverifyToken,controller.userfind)

router.get("/findall",controller.Alluserfind)

router.post("/changepassword",userverifyToken,controller.changepassword);

router.delete("/userdelete",userverifyToken,controller.userdelete)

router.patch("/updateuser",userverifyToken,controller.updateuser)

router.post("/login",controller.UserLogin)

router.post("/forgotpassword",controller.forgotpassword);

router.post("/verifyOTP", controller.verifyOTP);

router.post("/Resetpassword",controller.Resetpassword);

router.post("/CreateOrUpdate/:id?",controller.CreateOrUpdate)

module.exports = router