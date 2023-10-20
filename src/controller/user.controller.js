const express = require("express");
const User = require("../model/user");
const bcrypt = require("bcrypt");
const { passwordencrypt } = require("../services/commonservices");
const { passwordvalidation } = require("../services/commonservices");
const { NameValidation } = require("../services/commonservices");
const { EmailValidation } = require("../services/commonservices");
const { CompanyValidation } = require("../services/commonservices");
require("dotenv").config();
const msg = require("../utils/ResponseMessage.json");
const { userverifyToken } = require("../middleware/Auth");
const jwt = require("jsonwebtoken");
const { generateJwt } = require("../utils/jwt");
const transporter = require("../config/email.config");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");

// exports.create = async (req, res) => {
//   try {
//     let { Name, email, company, password } = req.body;

//     const existuser = await User.findOne({
//       $or: [{ email }, { company }],
//     });
//     if (!Name || !email || !company || !password) {
//       return res.status(400).json({
//         status: 400,
//         message: msg.REQUIRE,
//       });
//     }
//     if (!ValidName(Name)) {
//       return res.status(400).json({
//         status: 400,
//         message: msg.NAMEFORMAT,
//       });
//     }

//     if (!ValidEmail(email)) {
//       return res.status(400).json({
//         status: 400,
//         message: msg.EMAILFORMAT,
//       });
//     }

//     if (!ValidCompany(company)) {
//       return res.status(400).json({
//         status: 400,
//         message: msg.COMPANYFORMAT,
//       });
//     }
//     const existEmail = await User.findOne({ email });

//     if (existEmail) {
//       return res.status(400).json({
//         status: 400,
//         message: msg.EXISTEMAIL,
//       });
//     }
//     if (!passwordvalidation(password)) {
//       return res.status(400).json({
//         status: 400,
//         message: msg.PASSWORDVALID,
//       });
//     }
//     if (!existuser) {
//       password = await passwordencrypt(password);
//       email = email.toLowerCase();

//       let user = new User({
//         Name,
//         email,
//         company,
//         password,
//       });

//       user.save().then((data, error) => {
//         if (error) {
//           return res.status(400).json({
//             status: 400,
//             message: msg.NOTCREATE,
//           });
//         } else {
//           return res.status(201).json({
//             status: 201,
//             message: msg.CREATE,
//             data: data,
//           });
//         }
//       });
//     } else {
//       return res.status(400).json({
//         status: 400,
//         auth: false,
//         message: msg.EXIST,
//       });
//     }
//   } catch (error) {
//     console.log(error);
//   }
// };


exports.create = async (req, res) => {
  try {
    let { Name, email, company, password } = req.body;

    const existUser = await User.findOne({
      $or: [{ email }, { company }],
    });

    if (!Name || !email || !company || !password) {
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

    if (!CompanyValidation(company)) {
      return res.status(400).json({
        status: 400,
        message: msg.COMPANYFORMAT,
      });
    }

    const existEmail = await User.findOne({ email });

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

    if (!existUser) {
      password = await passwordencrypt(password);
      email = email.toLowerCase();

      let user = new User({
        Name,
        email,
        company,
        password,
      });

      user.save().then(async (data, error) => {
        if (error) {
          return res.status(400).json({
            status: 400,
            message: msg.NOTCREATE,
          });
        } else {
          // Send an email to the admin
          try {
            const transporter = nodemailer.createTransport({
              host: "sandbox.smtp.mailtrap.io",
              port: 2525,
              auth: {
                user: "69cf0fab16b53b",
                pass: "fe2ce7a0c7de5e",
              },
            });

            const mailOptions = {
              from: "69cf0fab16b53b",
              to: email,
              subject: "New User Registration",
              text: `A new user has registered:\nName: ${Name}\nEmail: ${email}\nCompany: ${company}`,
            };

            await transporter.sendMail(mailOptions);
      res.status(200).json({
        status: 200,
        message: msg.MAILSEND,
      });
          } catch (emailError) {
            console.log("Email error:", emailError);
          }

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
    return res.status(500).json({
      status: 500,
      message: msg.ERROR,
    });
  }
};



exports.Alluserfind = async (req, res) => {
  try {
    let userdata = await User.find();
    if (!userdata) {
      return res.status(404).json({
        status: 404,
        error: true,
        message: msg.NOTFOUND,
      });
    } else {
      res.status(201).json({
        status: 201,
        userdata,
        message: msg.LOGIN,
      });
    }
  } catch (error) {
    console.log(error);
  }
};



exports.userfind = async (req, res) => {
  try {
    let userdata = await User.findById({ _id: req.currentUser });
    if (!userdata) {
      return res.status(404).json({
        status: 404,
        error: true,
        message: msg.NOTFOUND,
      });
    } else {
      res.status(201).json({
        status: 201,
        userdata,
        message: msg.LOGIN1,
      });
    }
  } catch (error) {
    console.log(error);
  }
};



exports.changepassword = async (req, res) => {
  const { email, currentPassword, newPassword, confirmPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: msg.NOTFOUND,
      });
    } else {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          status: 400,
          message: msg.INCORRECT,
        });
      } else {
        if (!passwordvalidation(newPassword)) {
          return res.status(400).json({
            status: 400,
            message: msg.PASSWORDVALID,
          });
        }
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
          return res.status(400).json({
            status: 400,
            message: msg.NEWDIFFERENTOLD,
          });
        } else {
          if (newPassword !== confirmPassword) {
            return res.status(400).json({
              status: 400,
              Msg: msg.NEWCOMMATCH,
            });
          } else {
            const hashedPassword = await passwordencrypt(
              newPassword,
              user.password
            );
            await User.updateOne(
              { _id: user._id },
              { $set: { password: hashedPassword } }
            );
            return res.status(200).json({
              status: 200,
              Msg: msg.PSSWORDCHANGESUCC,
            });
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
};



exports.UserLogin = async (req, res) => {
  try {
    let { email, password } = req.body;
    let userLogin = await User.findOne({ email });
    if (!userLogin) {
      return res.status(404).json({
        status: 404,
        error: true,
        message: msg.NOTFOUND,
      });
    } else {
      if (userLogin.isdelete) {
        return res.status(400).json({
          status: 400,
          error: true,
          message: msg.ISDELETE,
        });
      } else {
        const isvalid = await bcrypt.compare(password, userLogin.password);
        if (!isvalid) {
          return res.status(400).json({
            status: 400,
            error: true,
            message: msg.NOTMATCH,
          });
        } else {
          const { error, token } = await generateJwt(userLogin._id);
          if (error) {
            return res.status(400).json({
              status: 400,
              error: true,
              message: msg.TOKEN,
            });
          } else {
            await User.findOneAndUpdate(
              { _id: userLogin._id },
              { $set: { token: token } },
              { useFindAndModify: false }
            );
            return res.status(200).json({
              status: 200,
              success: true,
              token: token,
              userLogin: email,
              message: msg.SUCCESS,
            });
          }
        }
      }
    }
  } catch (err) {
    console.error("Login error", err);
    return res.status(400).json({
      status: 400,
      error: true,
      Msg: msg.NOTSUCCESS,
    });
  }
};



exports.userdelete = async (req, res) => {
  try {
    const userId = req.currentUser;
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: msg.NOTFOUND,
      });
    } else {
      await User.findByIdAndUpdate(
        userId,
        { $set: { isdelete: true } },
        { useFindAndModify: false }
      );
      return res.status(200).json({
        status: 200,
        Msg: msg.DELETE,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      status: 400,
      message: error.message,
    });
  }
};



exports.updateuser = async (req, res) => {
  try {
    const userId = req.currentUser;
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: msg.NOTFOUND,
      });
    } else {
      const { Name, email, company } = req.body;

      const existEmail = await User.findOne({ email, _id: { $ne: user._id } });

      if (existEmail) {
        return res.status(400).json({
          status: 400,
          message: msg.EXISTEMAIL,
        });
      }
      if (!NameValidation(Name)) {
        return res.status(400).json({
          status: 400,
          message: msg.NAMEFORMAT,
        });
      }
      if (!CompanyValidation(company)) {
        return res.status(400).json({
          status: 400,
          message: msg.COMPANYFORMAT,
        });
      }
      let updatedUser = {
        Name,
        email,
        company,
      };
      await User.findByIdAndUpdate(userId, updatedUser, {
        useFindAndModify: false,
      });
      return res.status(200).json({
        status: 200,
        message: msg.USERUPDSUCC,
      });
    }
  } catch (error) {
    res.status(400).json({
      status: 400,
      message: error.message,
    });
  }
};



exports.forgotpassword = async (req, res) => {
  const { email } = req.body;
  try {
    const otp = Math.floor(Math.random() * 10000);
    const otpExpiration = new Date(Date.now() + 2 * 60 * 1000);

    const otpExpirationIST = otpExpiration.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });

    const user = await User.findOneAndUpdate(
      { email },
      { $set: { otp: otp, otpExpiration: otpExpirationIST } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: msg.NOTFOUND,
      });
    } else {
      if (user) {
        await user.save();
      }

      const transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "69cf0fab16b53b",
          pass: "fe2ce7a0c7de5e",
        },
      });

      const mailOptions = {
        from: "69cf0fab16b53b",
        to: email,
        subject: "Reset Password",
        text: `Your OTP for password reset is: ${otp}`,
      };

      await transporter.sendMail(mailOptions);
      res.status(200).json({
        status: 200,
        message: msg.MAILSEND,
      });
    }
  } catch (error) {
    console.log("Error sending OTP:", error);
    return res.status(500).json({
      status: 500,
      message: msg.INTERROR,
    });
  }
};



exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: msg.NOTFOUND,
      });
    } else {
      if (otp !== user.otp) {
        return res.status(400).json({
          status: 400,
          message: msg.INVALIDOTP,
        });
      } else {
        if (
          user.otpExpiration <
          new Date().toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
          })
        )
          return res.status(400).json({
            status: 400,
            message: msg.OTPEXPIRED,
          });
        else {
          user.otp = null;
          user.otpExpiration = null;
          await user.save();

          return res.status(201).json({
            status: 201,
            message: msg.OTPVERYSUCC,
          });
        }
      }
    }
  } catch (error) {
    console.log("Error verifying OTP:", error);
    return res.status(500).json({
      status: 500,
      message: msg.ERROROTP,
    });
  }
};



exports.Resetpassword = async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  if (!passwordvalidation(password)) {
    return res.status(400).json({
      status: 400,
      message: msg.PASSWORDVALID,
    });
  } else {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({
          status: 404,
          message: msg.NOTFOUND,
        });
      } else {
        if (password !== confirmPassword) {
          return res.status(400).json({
            status: 400,
            message: msg.PASSNOTMATCH,
          });
        } else if (
          user.otpExpiration <
          new Date().toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
          })
        ) {
          return res.status(400).json({
            status: 400,
            message: msg.SESSONOUT,
          });
        } else {
          const hashedPassword = await passwordencrypt(password);

          user.password = hashedPassword;
          await user.save();

          return res.status(201).json({
            status: 201,
            message: msg.PASSRESTSUCC,
          });
        }
      }
    } catch (error) {
      console.log("Error resetting password:", error);
      return res.status(500).json({
        status: 500,
        message: msg.INTERROR,
      });
    }
  }
};




exports.CreateOrUpdate = async (req, res) => {
  try {
    let { Name, email, company, password } = req.body;
    let _id = req.params.id;

    if (_id) {
      let user = await User.findById(_id);
      if (!user) {
        return res.status(404).json({
          status: 404,
          message: msg.NOTFOUND,
        });
      }

      const existEmail = await User.findOne({ email, _id: { $ne: user._id } });
      if (existEmail) {
        return res.status(400).json({
          status: 400,
          message: msg.EXISTEMAIL,
        });
      }

      if (!NameValidation(Name)) {
        return res.status(400).json({
          status: 400,
          message: msg.NAMEFORMAT,
        });
      }

      if (!CompanyValidation(company)) {
        return res.status(400).json({
          status: 400,
          message: msg.COMPANYFORMAT,
        });
      }

      let updatedUser = {
        Name,
        email,
        company,
      };
      await User.findByIdAndUpdate(_id, updatedUser, {
        useFindAndModify: false,
      });
      return res.status(200).json({
        status: 200,
        message: msg.USERUPDSUCC,
      });
    } else {
      // Create a new user
      const existUser = await User.findOne({
        $or: [{ email }, { company }],
      });

      if (!Name || !email || !company || !password) {
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

      if (!CompanyValidation(company)) {
        return res.status(400).json({
          status: 400,
          message: msg.COMPANYFORMAT,
        });
      }

      const existEmail = await User.findOne({ email });
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

      if (!existUser) {
        password = await passwordencrypt(password);
        email = email.toLowerCase();

        let user = new User({
          Name,
          email,
          company,
          password,
        });

        user.save().then(async (data, error) => {
          if (error) {
            return res.status(400).json({
              status: 400,
              message: msg.NOTCREATE,
            });
          } else {
            // Send an email to the admin
            try {
              const transporter = nodemailer.createTransport({
                host: "sandbox.smtp.mailtrap.io",
                port: 2525,
                auth: {
                  user: "69cf0fab16b53b",
                  pass: "fe2ce7a0c7de5e",
                },
              });

              const mailOptions = {
                from: "69cf0fab16b53b",
                to: email,
                subject: "New User Registration",
                text: `A new user has registered:\nName: ${Name}\nEmail: ${email}\nCompany: ${company}`,
              };

              await transporter.sendMail(mailOptions);
              res.status(200).json({
                status: 200,
                message: msg.MAILSEND,
              });
            } catch (emailError) {
              console.error("Email error:", emailError);
            }

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
          message: msg.EXIST,
        });
      }
    }
  } catch (error) {
    console.error("Internal Server Error:", error);
    return res.status(500).json({
      status: 500,
      message: msg.ERROR,
      error: error.message,
    });
  }
};