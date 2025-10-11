const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  let className = "No vehicles found"

  if (data && data.length > 0 && data[0].classification_name) {
    className = data[0].classification_name
  }
  
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}



/* ***************************
 *  Build detail by inventory id 
 * ************************** */

invCont.buildByInventoryId = async function (req, res, next) {
  const inventory_id = req.params.inventoryId
  const data = await invModel.getVehicleById(inventory_id)
  const detail = await utilities.buildDetailById(data)
  let nav = await utilities.getNav()

  if (data) {
    const vehicleTitle = `${data.inv_make} ${data.inv_model}` 
    res.render("./inventory/detail", {
      title: vehicleTitle,
      nav,
      detail,  
    })
  } else {
    const err = new Error('Vehicle not found')
    err.status = 404
    next(err)
  }
}


invCont.buildManagement = async function(req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    message: req.flash ? req.flash("message") : null
  })
}

invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
    message: null,
    classification_name: ""
  })
}


invCont.insertClassification = async function(req, res, next) {
  const { classification_name } = req.body
  try {
    const result = await invModel.insertClassification(classification_name)
    console.log("Insert result:", result)
    if (result) {
      let nav = await utilities.getNav()
      req.flash("message", "Classification added successfully!")
      res.render("inventory/management", {
        title: "Inventory Management",
        nav,
        message: "Classification added successfully!"
      })
    } else {
      throw new Error("Insert failed")
    }
  } catch (error) {
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: [{ param: "classification_name", msg: "Failed to add classification. Try again." }],
      message: null,
      classification_name
    })
  }
}

invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  let classificationList = await utilities.buildClassificationList()
  res.render("inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    classificationList,
    errors: null,
    message: null
  })
}

invCont.insertInventory = async function (req, res, next) {
  try {
    const result = await invModel.insertInventory(req.body)
    if (result) {
      let nav = await utilities.getNav()
      req.flash("message", "Inventory item added successfully!")
      res.render("inventory/management", {
        title: "Inventory Management",
        nav,
        message: "Inventory item added successfully!"
      })
    } else {
      throw new Error("Insert failed")
    }
  } catch (error) {
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList(req.body.classification_id)
    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors: [{ msg: "Failed to add inventory. Try again." }],
      ...req.body,
      message: null
    })
  }
}


module.exports = invCont