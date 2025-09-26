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
  const className = data[0].classification_name
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



module.exports = invCont