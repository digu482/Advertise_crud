const mongoose = require('mongoose');
const Userschema = new mongoose.Schema({
    Name :{
        type : String,
    },
    email : {
        type : String, 
    },
    company : {
        type : String,
    },
    password : {
        type : String
    },
    isdelete : {
        type : Boolean,
        default : true
    },
    otp : {
        type : String
    },
    otpExpiration : {
        type: String,
    },
    token: {
        type: String
    }
},{ versionKey: false })

const User = new mongoose.model('User', Userschema);

module.exports = User;