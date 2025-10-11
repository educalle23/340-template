const utilities = require("../utilities/")
const accountModel = require("../models/account-model")

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


async function processLogin(req, res, next) {
  const { account_email, account_password } = req.body
  let nav = await utilities.getNav()
  try {
    const account = await accountModel.findAccountByEmail(account_email)
    if (!account) {
      return res.render("account/login", {
        title: "Login",
        nav,
        errors: [{ msg: "Email not found." }]
      })
    }
    // Aquí deberías comparar la contraseña (idealmente encriptada)
    if (account.account_password !== account_password) {
      return res.render("account/login", {
        title: "Login",
        nav,
        errors: [{ msg: "Incorrect password." }]
      })
    }
    // Si todo está bien, puedes redirigir o mostrar mensaje de éxito
    res.render("account/login", {
      title: "Login",
      nav,
      message: "Login successful!",
      errors: null
    })
  } catch (error) {
    res.render("account/login", {
      title: "Login",
      nav,
      errors: [{ msg: "Login failed. Please try again." }]
    })
  }
}
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

async function registerAccount(req, res, next) {
  const { account_firstname, account_lastname, account_email, account_password } = req.body
  try {
    const newAccount = await accountModel.registerAccount({
      account_firstname,
      account_lastname,
      account_email,
      account_password
    })

    // Opcional: puedes mostrar un mensaje de éxito o redirigir al login
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

module.exports = { buildLogin, buildRegister, registerAccount, processLogin }
