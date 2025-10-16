const { body, validationResult } = require("express-validator")
const reviewModel = require("../models/review-model")
const utilities = require(".")

const validate = {}

/* **********************************
 *  Review Validation Rules
 * ********************************* */
validate.reviewRules = () => {
  return [
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5 stars."),

    body("review_text")
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage("Review must be between 10 and 500 characters."),

    body("inv_id")
      .isInt()
      .withMessage("Invalid vehicle ID."),
  ]
}

/* ******************************
 * Check data and return errors or redirect to success
 * ***************************** */
validate.checkReviewData = async (req, res, next) => {
  const { inv_id, rating, review_text } = req.body
  let errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    // Redirect back to vehicle detail page with errors
    return res.redirect(`/inv/detail/${inv_id}?error=review`)
  }
  next()
}

module.exports = validate