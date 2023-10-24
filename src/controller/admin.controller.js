const express = require("express");
const Admin = require("../model/admin");
const User = require("../model/user");
const bcrypt = require("bcrypt");
const { passwordencrypt } = require("../services/commonservices");
const { passwordvalidation } = require("../services/commonservices");
const { NameValidation } = require("../services/commonservices");
const { EmailValidation } = require("../services/commonservices");
const msg = require("../utils/ResponseMessage.json");
const transporter = require("../config/email.config");
const nodemailer = require("nodemailer");



exports.Admincreate = async (req, res) => {
  try {
    let { Name, email, password } = req.body;

    const existuser = await Admin.findOne({ email });
    if (!Name || !email || !password) {
      return res.status(400).json({
        status: 400,
        message: msg.REQUIRE,
      });
    }
    if (!NameValidation(Name)) {
      return res.status(400).json({
        status: 400,
        message: msg.NAMEFORMAT,
      });
    }

    if (!EmailValidation(email)) {
      return res.status(400).json({
        status: 400,
        message: msg.EMAILFORMAT,
      });
    }

    const existEmail = await Admin.findOne({ email });

    if (existEmail) {
      return res.status(400).json({
        status: 400,
        message: msg.EXISTEMAIL,
      });
    }
    if (!passwordvalidation(password)) {
      return res.status(400).json({
        status: 400,
        message: msg.PASSWORDVALID,
      });
    }
    if (!existuser) {
      password = await passwordencrypt(password);
      email = email.toLowerCase();

      let user = new Admin({
        Name,
        email,
        password,
      });

      user.save().then((data, error) => {
        if (error) {
          return res.status(400).json({
            status: 400,
            message: msg.NOTCREATE,
          });
        } else {
          return res.status(201).json({
            status: 201,
            message: msg.CREATE,
            data: data,
          });
        }
      });
    } else {
      return res.status(400).json({
        status: 400,
        auth: false,
        message: msg.EXIST,
      });
    }
  } catch (error) {
    console.log(error);
  }
};




// exports.adminApproveOrReject = async (req, res) => {
//   try {
//     const { _id, Request } = req.body; 
//     let user = await User.findByIdAndUpdate(_id);

//     if (!user) {
//       return res.status(404).json({
//         status: 404,
//         message: msg.NOTFOUND,
//       });
//     }

//     if (Request === 'approve') {
//       user.isdelete = false;
//       await user.save();
//       return res.status(200).json({
//         status: 200,
//         message: msg.APPROVE,
//       });
//     } else if (Request === 'reject') {
//       user.isdelete = true;
//       await user.save();
//       return res.status(200).json({
//         status: 200,
//         message: msg.REJECT,
//       });
//     } else {
//       return res.status(400).json({
//         status: 400,
//         message: msg.INVALID,
//       });
//     }
//   } catch (error) {
//     return res.status(500).json({
//       status: 500,
//       message: msg.ERROR,
//     });
//   }
// };




exports.adminApproveOrReject = async (req, res) => {
  try {
    const { _id, Request } = req.body;
    let user = await User.findByIdAndUpdate(_id);

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: msg.NOTFOUND,
      });
    }

    if (Request === 'approve') {
      user.isdelete = false;
      await user.save();

      // Send an approval email to the user
      const approvalEmailOptions = {
        from: "user",
        to:"user",
        subject: 'Approval Notification',
        text: 'Your account has been approved!',
      };

      transporter.sendMail(approvalEmailOptions, (error, info) => {
        if (error) {
          console.error('Error sending approval email:', error);
        } else {
          console.log('Approval email sent:', info.response);
        }
      });

      return res.status(200).json({
        status: 200,
        message: msg.APPROVE,
      });
    } else if (Request === 'reject') {
      user.isdelete = true;
      await user.save();

      // Send a rejection email to the user
      const rejectionEmailOptions = {
        from: "user",
        to: "user",
        subject: 'Rejection Notification',
        text: 'Your account has been rejected.',
      };

      transporter.sendMail(rejectionEmailOptions, (error, info) => {
        if (error) {
          console.error('Error sending rejection email:', error);
        } else {
          console.log('Rejection email sent:', info.response);
        }
      });

      return res.status(200).json({
        status: 200,
        message: msg.REJECT,
      });
    } else {
      return res.status(400).json({
        status: 400,
        message: msg.INVALID,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: msg.ERROR,
    });
  }
};




