// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const errorController = require("../controllers/errorController.js")
const { classificationRules, checkClassificationData, inventoryRules, checkInventoryData } = require("../utilities/inventory-validation")

router.get("/trigger-error", errorController.triggerError)

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

router.get("/detail/:inventoryId", invController.buildByInventoryId)

router.get("", invController.buildManagement)

router.get("/add-classification", invController.buildAddClassification)

router.post(
  "/add-classification",
  classificationRules(),
  checkClassificationData,
  invController.insertClassification
)

router.get("/add-inventory", invController.buildAddInventory)

router.post(
  "/add-inventory",
  inventoryRules(),
  checkInventoryData,
  invController.insertInventory
)

module.exports = router;