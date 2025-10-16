const express = require("express")
const router = new express.Router()
const reviewController = require("../controllers/reviewController")
const utilities = require("../utilities/")
const reviewValidate = require("../utilities/review-validation")
const { route } = require("./static")

router.get("/", reviewController.getAllReviews)

router.get("/add/", utilities.checkJWTToken,reviewController.buildReviewForm)

router.get("/delete/", utilities.checkJWTToken,reviewController.deleteReview)



// Route to process adding a review - PROTECTED (must be logged in)
router.post(
  "/add",
  utilities.checkJWTToken,  
  reviewValidate.reviewRules(),
  reviewValidate.checkReviewData,
  utilities.handleErrors(reviewController.addReview)
)

// Route to process deleting a review - PROTECTED (must be owner or admin)
router.get(
  "/delete/:review_id",
  utilities.checkJWTToken,  // Must be logged in
  utilities.handleErrors(reviewController.deleteReview)
)

module.exports = router
