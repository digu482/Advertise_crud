const express = require('express');
const mongoose = require('mongoose');
const app = express();
require("dotenv").config();
const port = process.env.PORT || 8000;
require("./src/config/db")
const bodyParser = require("body-parser")
const cors = require("cors")

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors()) 



const userRouters = require("./src/route/user.route")
app.use("/user",userRouters)
    
const adminRouters = require("./src/route/admin.route")
app.use("/admin",adminRouters)


app.listen(port, () => {
    console.log(`connection is setup at ${port}`);
}); 