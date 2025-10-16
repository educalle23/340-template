const pool = require("../database/") // o la ruta correcta a tu pool de conexión

async function registerAccount({ account_firstname, account_lastname, account_email, account_password }) {
  try {
    const sql = `
      INSERT INTO account (account_firstname, account_lastname, account_email, account_password)
      VALUES ($1, $2, $3, $4)
      RETURNING account_id, account_firstname, account_lastname, account_email
    `
    const result = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_password
    ])
    return result.rows[0] // Devuelve el usuario registrado
  } catch (error) {
    console.error("Error registrando usuario:", error)
    throw error
  }
}

async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT * FROM account WHERE LOWER(account_email) = LOWER($1)"
    const result = await pool.query(sql, [account_email])
    return result.rowCount
  } catch (error) {
    console.error(error)
    return false
  }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}


/* *****************************
*   Get account by account_id
* *************************** */
async function getAccountById(account_id) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_id = $1',
      [account_id]
    )
    return result.rows[0]
  } catch (error) {
    return error.message
  }
}

/* *****************************
*   Update account information
* *************************** */
async function updateAccount(account_id, account_firstname, account_lastname, account_email) {
  try {
    const sql = 
      "UPDATE public.account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *"
    const data = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
    return null
  }
}

/* *****************************
*   Update password
* *************************** */
async function updatePassword(account_id, account_password) {
  try {
    const sql = 
      "UPDATE public.account SET account_password = $1 WHERE account_id = $2 RETURNING *"
    const data = await pool.query(sql, [
      account_password,
      account_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
    return null
  }
}

module.exports = {checkExistingEmail, registerAccount, getAccountByEmail, updatePassword, updateAccount, getAccountById }