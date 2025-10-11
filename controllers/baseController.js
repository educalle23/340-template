const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){
  req.flash("notice", "This is a flash message.")
  const nav = await utilities.getNav()
  res.render("index", {title: "Home", nav})
}

module.exports = baseController