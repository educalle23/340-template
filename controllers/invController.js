const invModel = require("../models/inventory-model")
const reviewModel = require("../models/review-model")
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


invCont.buildByInventoryId = async function (req, res, next) {
  try {
    const inventory_id = req.params.inventoryId
    const data = await invModel.getVehicleById(inventory_id)
    
    if (!data) {
      const err = new Error('Vehicle not found')
      err.status = 404
      return next(err)
    }
    
    // Get reviews for this vehicle
    const reviews = await reviewModel.getReviewsByInventoryId(inventory_id)
    
    // Get review statistics
    const reviewStats = await reviewModel.getReviewStats(inventory_id)
    
    // Check if current user already reviewed (if logged in)
    let hasReviewed = false
    if (res.locals.accountData?.account_id) {
      hasReviewed = await reviewModel.hasUserReviewed(inventory_id, res.locals.accountData.account_id)
    }
    
    // Build the vehicle detail HTML
    const detail = await utilities.buildDetailById(data)
    let nav = await utilities.getNav()
    const vehicleTitle = `${data.inv_make} ${data.inv_model}` 
    
    res.render("./inventory/detail", {
      title: vehicleTitle,
      nav,
      detail,
      vehicle: data,  // ← Necesario para las reviews (vehicle.inv_id)
      reviews: reviews || [],
      reviewStats: reviewStats || { total_reviews: 0, average_rating: 0 },
      hasReviewed: hasReviewed || false,
      errors: null,
    })
    
  } catch (error) {
    console.error("Error in buildByInventoryId:", error)
    next(error)
  }
}


invCont.buildManagement = async function(req, res, next) {
  let nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList()

  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    classificationSelect,
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

//Builkd the view for the management
invCont.getInventoryJSON = async function (req, res, next) {
  try {
    const classification_id = req.params.classification_id
    const data = await invModel.getInventoryByClassificationId(classification_id)
    res.json(data)
  } catch (error) {
    next(error)
  }
}

invCont.buildEditInventory = async function (req, res, next) {
  try {
    const inventoryId = req.params.inventoryId
    const item = await invModel.getVehicleById(inventoryId)
    if (!item) {
      const err = new Error("Inventory item not found")
      err.status = 404
      return next(err)
    }
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList(item.classification_id)
    res.render("inventory/edit-inventory", {
      title: `Edit ${item.inv_make} ${item.inv_model}`,
      nav,
      classificationList,
      ...item,
      errors: null,
      message: null
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryById(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}

/* ***************************
 *  Build delete confirmation view
 * ************************** */
invCont.buildDeleteConfirmation = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getVehicleById(inv_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./account/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
  })
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
invCont.deleteInventoryItem = async function (req, res, next) {
  let nav = await utilities.getNav()
  const inv_id = parseInt(req.body.inv_id)
  
  const deleteResult = await invModel.deleteInventoryItem(inv_id)

  if (deleteResult) {
    req.flash("notice", "The deletion was successful.")
    res.redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, the delete failed.")
    res.redirect("/inv/delete/" + inv_id)
  }
}

module.exports = invCont