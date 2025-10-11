/* **********************
 *   Check for existing email
 * ********************* */
// async function checkExistingEmail(account_email){
//   try {
//     const sql = "SELECT * FROM account WHERE account_email = $1"
//     const email = await pool.query(sql, [account_email])
//     console.log(email)
//     return email.rowCount > 0
    
//   } catch (error) {
//     return error.message
//   }
// }
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
    console.log("Buscando email:", account_email) // <-- Agrega este log
    const sql = "SELECT * FROM account WHERE LOWER(account_email) = LOWER($1)"
    const result = await pool.query(sql, [account_email])
    console.log("Resultado:", result.rows) // <-- Agrega este log
    return result.rowCount
  } catch (error) {
    console.error(error)
    return false
  }
}

module.exports = {checkExistingEmail, registerAccount}