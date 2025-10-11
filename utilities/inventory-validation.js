
const { body, validationResult } = require("express-validator")
const validate = {}

validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .notEmpty()
      .isLength({ min: 1 })
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage("Classification name cannot contain spaces or special characters.")
  ]
}

validate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    const utilities = require("../utilities/")
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: errors.array(),
      classification_name,
      message: null
    })
    return
  }
  next()
}

validate.inventoryRules = () => [
  body("inv_make").trim().notEmpty().withMessage("Make is required."),
  body("inv_model").trim().notEmpty().withMessage("Model is required."),
  body("inv_year").isInt({ min: 1900, max: 2100 }).withMessage("Year must be valid."),
  body("inv_description").trim().notEmpty().withMessage("Description is required."),
  body("inv_price").isFloat({ min: 0 }).withMessage("Price must be a positive number."),
  body("inv_miles").isInt({ min: 0 }).withMessage("Miles must be a positive integer."),
  body("inv_color").trim().notEmpty().withMessage("Color is required."),
  body("classification_id").notEmpty().withMessage("Classification is required."),
  body("inv_image").trim().notEmpty().withMessage("Image path is required."),
  body("inv_thumbnail").trim().notEmpty().withMessage("Thumbnail path is required.")
]

validate.checkInventoryData = async (req, res, next) => {
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    const utilities = require("../utilities/")
    let classificationList = await utilities.buildClassificationList(req.body.classification_id)
    let nav = await utilities.getNav()
    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors: errors.array(),
      ...req.body,
      message: null
    })
    return
  }
  next()
}

module.exports = validate