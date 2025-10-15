const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const bcrypt = require("bcrypt")

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  })
}


// async function processLogin(req, res, next) {
//   const { account_email, account_password } = req.body
//   let nav = await utilities.getNav()
//   try {
//     const account = await accountModel.findAccountByEmail(account_email)
//     if (!account) {
//       return res.render("account/login", {
//         title: "Login",
//         nav,
//         errors: [{ msg: "Email not found." }]
//       })
//     }
//     // Aquí deberías comparar la contraseña (idealmente encriptada)
//     if (account.account_password !== account_password) {
//       return res.render("account/login", {
//         title: "Login",
//         nav,
//         errors: [{ msg: "Incorrect password." }]
//       })
//     }
//     // Si todo está bien, puedes redirigir o mostrar mensaje de éxito
//     res.render("account/login", {
//       title: "Login",
//       nav,
//       message: "Login successful!",
//       errors: null
//     })
//   } catch (error) {
//     res.render("account/login", {
//       title: "Login",
//       nav,
//       errors: [{ msg: "Login failed. Please try again." }]
//     })
//   }
// }
/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}


const saltRounds = 10

async function registerAccount(req, res, next) {
  const { account_firstname, account_lastname, account_email, account_password } = req.body
  try {
    const hashedPassword = await bcrypt.hash(account_password, saltRounds)
    const newAccount = await accountModel.registerAccount({
      account_firstname,
      account_lastname,
      account_email,
      account_password: hashedPassword
    })
    let nav = await utilities.getNav()
    res.render("account/login", {
      title: "Login",
      nav,
      message: "Registration successful! Please log in.",
      errors: null
    })
  } catch (error) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      title: "Register",
      nav,
      errors: [{ msg: "Registration failed. Please try again." }]
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    let nav = await utilities.getNav()
    res.status(400).render("account/login", {
    title: "Login",
    nav,
    errors: [{ msg: "Access Forbidden. Please try again." }],
    account_email,
    })
  }
}

async function buildAccountManagement(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
    message: req.flash ? req.flash("message") : null
  })
}

/* ****************************************
*  Deliver account update view
* *************************************** */
async function buildUpdateAccount(req, res, next) {
  let nav = await utilities.getNav()
  const account_id = parseInt(req.params.account_id)
  
  // Get account data from database
  const accountData = await accountModel.getAccountById(account_id)
  
  res.render("account/update-account", {
    title: "Update Account",
    nav,
    errors: null,
    account_id: accountData.account_id,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
  })
}

/* ****************************************
*  Process Account Update
* *************************************** */
async function updateAccount(req, res, next) {
  let nav = await utilities.getNav()
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_id,
  } = req.body

  const updateResult = await accountModel.updateAccount(
    account_id,
    account_firstname,
    account_lastname,
    account_email
  )

  if (updateResult) {
    // Get updated account data
    const accountData = await accountModel.getAccountById(account_id)
    
    // Delete password from accountData before creating new JWT
    delete accountData.account_password
    
    // Create new JWT with updated information
    const accessToken = jwt.sign(
      accountData, 
      process.env.ACCESS_TOKEN_SECRET, 
      { expiresIn: 3600 * 1000 }
    )
    
    // Set new cookie with updated JWT
    if(process.env.NODE_ENV === 'development') {
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
    } else {
      res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
    }
    
    req.flash("notice", `Congratulations, ${account_firstname}, your account was successfully updated.`)
    res.redirect("/account/")
  } else {
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("account/update-account", {
      title: "Update Account",
      nav,
      errors: null,
      account_id,
      account_firstname,
      account_lastname,
      account_email,
    })
  }
}

/* ****************************************
*  Process Password Change
* *************************************** */
async function changePassword(req, res, next) {
  let nav = await utilities.getNav()
  const { account_password, account_id } = req.body

  // Hash the new password
  let hashedPassword
  try {
    hashedPassword = await bcrypt.hash(account_password, 10)
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing the password change.")
    res.status(500).render("account/update-account", {
      title: "Update Account",
      nav,
      errors: null,
      account_id,
    })
    return
  }

  const updateResult = await accountModel.updatePassword(
    account_id,
    hashedPassword
  )

  if (updateResult) {
    req.flash("notice", "Your password was successfully updated.")
    res.redirect("/account/")
  } else {
    const accountData = await accountModel.getAccountById(account_id)
    req.flash("notice", "Sorry, the password update failed.")
    res.status(501).render("account/update-account", {
      title: "Update Account",
      nav,
      errors: null,
      account_id: accountData.account_id,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
    })
  }
}

/* ****************************************
*  Process Logout
* *************************************** */
async function logout(req, res, next) {
  // Delete the JWT cookie
  res.clearCookie("jwt")
  
  // Redirect to home view
  req.flash("notice", "You have been logged out successfully.")
  res.redirect("/")
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement,  buildUpdateAccount, updateAccount, changePassword, logout }
