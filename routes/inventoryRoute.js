// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const errorController = require("../controllers/errorController.js")
const { classificationRules, checkClassificationData, inventoryRules, checkInventoryData, checkUpdateData } = require("../utilities/inventory-validation")
const utilitites  = require("../utilities")

router.get("/trigger-error", errorController.triggerError)

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

router.get("/detail/:inventoryId", invController.buildByInventoryId)

router.get("", utilitites.checkAccountType, invController.buildManagement)

router.get("/add-classification", utilitites.checkAccountType, invController.buildAddClassification)

router.get("/getInventory/:classification_id", invController.getInventoryJSON)

router.get("/add-inventory", utilitites.checkAccountType,invController.buildAddInventory)

router.get("/edit/:inventoryId", invController.buildEditInventory)

router.get("/delete/:inv_id", invController.buildDeleteConfirmation)

router.post(
  "/add-classification",
  utilitites.checkAccountType,
  classificationRules(),
  checkClassificationData,
  invController.insertClassification
)


router.post(
  "/add-inventory",
  utilitites.checkAccountType,
  inventoryRules(),
  checkInventoryData,
  invController.insertInventory
)

router.post(
  "/update", 
  utilitites.checkAccountType,
  inventoryRules(),
  checkUpdateData,
  invController.updateInventory
)

router.post(
  "/delete/",
  utilitites.checkAccountType,
  invController.deleteInventoryItem
)

module.exports = router;