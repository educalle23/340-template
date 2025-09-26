const errorCont = {}

/* ***************************
 *  Trigger intentional 500 error
 * ************************** */

errorCont.triggerError = async function (req, res, next) {

  console.log("=== TRIGGER ERROR EJECUTANDOSE ===") // ✅ Debug
  console.log("About to throw error...")
  const err = new Error("This is an intentional 500 error for testing purposes")
  err.status = 500
  console.log("Error created:", err.message)
  next(err)
}

module.exports = errorCont