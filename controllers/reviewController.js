const reviewModel = require("../models/review-model")
const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const reviewCont = {}

/* ***************************
 *  Process adding a review
 * ************************** */
reviewCont.addReview = async function (req, res, next) {
  const { inv_id, rating, review_text } = req.body
  const account_id = res.locals.accountData.account_id

  // Check if user already reviewed this vehicle
  const alreadyReviewed = await reviewModel.hasUserReviewed(inv_id, account_id)
  
  if (alreadyReviewed) {
    req.flash("notice", "You have already reviewed this vehicle.")
    return res.redirect(`/inv/detail/${inv_id}`)
  }

  const result = await reviewModel.addReview(inv_id, account_id, rating, review_text)

  if (result) {
    req.flash("notice", "Thank you for your review!")
    res.redirect(`/inv/detail/${inv_id}`)
  } else {
    req.flash("notice", "Sorry, there was an error submitting your review.")
    res.redirect(`/inv/detail/${inv_id}`)
  }
}

/* ***************************
 *  Process deleting a review
 * ************************** */
reviewCont.deleteReview = async function (req, res, next) {
  const review_id = parseInt(req.params.review_id)
  const account_id = res.locals.accountData.account_id
  const account_type = res.locals.accountData.account_type

  // Get review to check ownership and get inv_id for redirect
  const review = await reviewModel.getReviewById(review_id)

  if (!review) {
    req.flash("notice", "Review not found.")
    return res.redirect("/")
  }

  // Check if user is the owner or an admin
  if (review.account_id !== account_id && account_type !== "Admin") {
    req.flash("notice", "You do not have permission to delete this review.")
    return res.redirect(`/inv/detail/${review.inv_id}`)
  }

  const result = await reviewModel.deleteReview(review_id)

  if (result) {
    req.flash("notice", "Review deleted successfully.")
  } else {
    req.flash("notice", "Sorry, there was an error deleting the review.")
  }

  res.redirect(`/inv/detail/${review.inv_id}`)
}


reviewCont.getAllReviews = async function(req, res, next) {
  const reviews = await reviewModel.getAllReviews();
  let nav = await utilities.getNav()
  res.render("reviews/review-list", {
    title: "All the reviews",
    nav,
    reviews
  });
}


reviewCont.buildReviewForm = async function (req, res, next) {
  try {
    const account_id = res.locals.accountData?.account_id
    
    if (!account_id) {
      req.flash("notice", "Please log in to add a review.")
      return res.redirect("/account/login")
    }

    // Get inv_id from query parameter (if coming from detail page)
    const preselectedInvId = req.query.inv_id ? parseInt(req.query.inv_id) : null

    // Get all vehicles
    const allVehicles = await invModel.getInventory()
    
    if (!allVehicles || allVehicles.length === 0) {
      let nav = await utilities.getNav()
      return res.render("reviews/review-form", {
        title: "Add a Vehicle Review",
        nav,
        vehicles: [],
        selectedVehicle: null,
        preselectedInvId: null,
        errors: null,
      })
    }
    
    // Get vehicles already reviewed by this user
    const reviewedVehicles = await reviewModel.getVehiclesReviewedByUser(account_id)
    const reviewedIds = reviewedVehicles.map(v => v.inv_id)
    
    // Filter out already reviewed vehicles
    const availableVehicles = allVehicles.filter(v => !reviewedIds.includes(v.inv_id))

    // Get the selected vehicle details (if preselected)
    let selectedVehicle = null
    if (preselectedInvId) {
      selectedVehicle = availableVehicles.find(v => v.inv_id === preselectedInvId)
      
      // If the vehicle was already reviewed, redirect back
      if (!selectedVehicle && reviewedIds.includes(preselectedInvId)) {
        req.flash("notice", "You have already reviewed this vehicle.")
        return res.redirect(`/inv/detail/${preselectedInvId}`)
      }
    }

    let nav = await utilities.getNav()
    
    // Build dynamic title
    const pageTitle = selectedVehicle 
      ? `Review ${selectedVehicle.inv_year} ${selectedVehicle.inv_make} ${selectedVehicle.inv_model}`
      : "Add a Vehicle Review"
    
    res.render("reviews/review-form", {
      title: pageTitle,
      nav,
      vehicles: availableVehicles,
      selectedVehicle,
      preselectedInvId,
      errors: null,
    })
    
  } catch (error) {
    console.error("Error in buildReviewForm controller:", error)
    next(error)
  }
}

module.exports = reviewCont