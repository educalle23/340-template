// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const errorController = require("../controllers/errorController.js")

router.get("/trigger-error", errorController.triggerError)

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

router.get("/detail/:inventoryId", invController.buildByInventoryId)


module.exports = router;