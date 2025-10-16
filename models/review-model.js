const pool = require("../database/")

/* ***************************
 *  Add new review
 * ************************** */
async function addReview(inv_id, account_id, rating, review_text) {
  try {
    const sql = `
      INSERT INTO public.reviews (inv_id, account_id, rating, review_text)
      VALUES ($1, $2, $3, $4)
      RETURNING review_id, inv_id, account_id, rating, review_text, review_date
    `
    const result = await pool.query(sql, [inv_id, account_id, rating, review_text])
    return result.rows[0]
  } catch (error) {
    console.error("addReview error: " + error)
    return null
  }
}

/* ***************************
 *  Get all reviews for a vehicle
 * ************************** */
async function getReviewsByInventoryId(inv_id) {
  try {
    const sql = `
      SELECT 
        r.review_id, 
        r.inv_id, 
        r.account_id, 
        r.rating, 
        r.review_text, 
        r.review_date,
        a.account_firstname,
        a.account_lastname
      FROM public.reviews r
      JOIN public.account a ON r.account_id = a.account_id
      WHERE r.inv_id = $1
      ORDER BY r.review_date DESC
    `
    const result = await pool.query(sql, [inv_id])
    return result.rows
  } catch (error) {
    console.error("getReviewsByInventoryId error: " + error)
    return []
  }
}

/* ***************************
 *  Get review statistics for a vehicle
 * ************************** */
async function getReviewStats(inv_id) {
  try {
    const sql = `
      SELECT 
        COUNT(*) as total_reviews,
        ROUND(AVG(rating)::numeric, 1) as average_rating
      FROM public.reviews
      WHERE inv_id = $1
    `
    const result = await pool.query(sql, [inv_id])
    return result.rows[0]
  } catch (error) {
    console.error("getReviewStats error: " + error)
    return { total_reviews: 0, average_rating: 0 }
  }
}

/* ***************************
 *  Delete review by review_id
 * ************************** */
async function deleteReview(review_id) {
  try {
    const sql = 'DELETE FROM public.reviews WHERE review_id = $1'
    const result = await pool.query(sql, [review_id])
    return result.rowCount > 0
  } catch (error) {
    console.error("deleteReview error: " + error)
    return false
  }
}

/* ***************************
 *  Get review by review_id (for authorization checks)
 * ************************** */
async function getReviewById(review_id) {
  try {
    const sql = `
      SELECT 
        r.review_id, 
        r.inv_id, 
        r.account_id, 
        r.rating, 
        r.review_text, 
        r.review_date,
        a.account_firstname,
        a.account_lastname
      FROM public.reviews r
      JOIN public.account a ON r.account_id = a.account_id
      WHERE r.review_id = $1
    `
    const result = await pool.query(sql, [review_id])
    return result.rows[0]
  } catch (error) {
    console.error("getReviewById error: " + error)
    return null
  }
}

/* ***************************
 *  Check if user already reviewed this vehicle
 * ************************** */
async function hasUserReviewed(inv_id, account_id) {
  try {
    const sql = `
      SELECT review_id 
      FROM public.reviews 
      WHERE inv_id = $1 AND account_id = $2
    `
    const result = await pool.query(sql, [inv_id, account_id])
    return result.rows.length > 0
  } catch (error) {
    console.error("hasUserReviewed error: " + error)
    return false
  }
}

async function getAllReviews() {
  try {
    const sql = `
      SELECT 
        r.review_id,
        r.review_text,
        r.rating,
        r.review_date,
        a.account_firstname || ' ' || a.account_lastname AS reviewer_name,
        i.inv_make || ' ' || i.inv_model AS vehicle_name,
        i.inv_thumbnail  AS vehicle_image
      FROM public.reviews AS r
      JOIN public.account AS a
        ON r.account_id = a.account_id
      JOIN public.inventory AS i
        ON r.inv_id = i.inv_id
      ORDER BY r.review_date DESC;
    `;

    const result = await pool.query(sql);
    return result.rows;
  } catch (error) {
    console.error("Error in getAllReviews model:", error);
    throw error;
  }
}

async function getVehiclesReviewedByUser(account_id) {
  try {
    const sql = `
      SELECT DISTINCT inv_id
      FROM public.reviews
      WHERE account_id = $1
    `
    const result = await pool.query(sql, [account_id])
    return result.rows
  } catch (error) {
    console.error("getVehiclesReviewedByUser error: " + error)
    return []
  }
}

module.exports = {
  addReview,
  getReviewsByInventoryId,
  getReviewStats,
  deleteReview,
  getReviewById,
  hasUserReviewed, getAllReviews, getVehiclesReviewedByUser
}