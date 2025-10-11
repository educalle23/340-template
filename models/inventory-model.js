const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

async function getVehicleById(inventory_id) {
  try{
    const data = await pool.query(
      `SELECT * from public.inventory
      where inv_id = $1` ,
      [inventory_id]
    )
    return data.rows[0]
  } catch (error) {
    console.error("getVehicleById error: " + error)
  }
}

async function insertClassification(classification_name) {
  try {
    const sql = `
      INSERT INTO public.classification (classification_name)
      VALUES ($1)
      RETURNING classification_id, classification_name
    `
    const result = await pool.query(sql, [classification_name])
    console.log("Insert result:", result)
    return result.rows[0]
  } catch (error) {
    console.error("Error inserting classification:", error)
    return null
  }
}

async function insertInventory(data) {
  try {
    const sql = `
      INSERT INTO public.inventory (
        inv_make, inv_model, inv_year, inv_description, inv_price,
        inv_miles, inv_color, classification_id, inv_image, inv_thumbnail
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING inv_id
    `
    const values = [
      data.inv_make,
      data.inv_model,
      data.inv_year,
      data.inv_description,
      data.inv_price,
      data.inv_miles,
      data.inv_color,
      data.classification_id,
      data.inv_image,
      data.inv_thumbnail
    ]
    const result = await pool.query(sql, values)
    return result.rows[0]
  } catch (error) {
    console.error("Error inserting inventory:", error)
    return null
  }
}


module.exports = {getClassifications, getInventoryByClassificationId, getVehicleById, insertClassification, insertInventory};
