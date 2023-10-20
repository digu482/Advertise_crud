const mongoose = require('mongoose');
const Adminschema = new mongoose.Schema({
    Name :{
        type : String,
    },
    email : {
        type : String, 
    },
    password : {
        type : String
    },
},{ versionKey: false })

const Admin = new mongoose.model('Admin', Adminschema);

module.exports = Admin;