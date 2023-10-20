const express = require('express')
const router = express.Router()
const Admin = require("../model/admin");
const controller = require("../controller/admin.controller")


router.post("/create",controller.Admincreate)

router.post("/approvereject",controller.adminApproveOrReject)

module.exports = router