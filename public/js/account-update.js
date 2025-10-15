// Client-side validation for account update form
const updateForm = document.querySelector("#updateForm")
if (updateForm) {
  updateForm.addEventListener("submit", function(event) {
    const firstname = document.getElementById("account_firstname").value.trim()
    const lastname = document.getElementById("account_lastname").value.trim()
    const email = document.getElementById("account_email").value.trim()

    if (firstname.length < 1 || lastname.length < 1 || email.length < 1) {
      event.preventDefault()
      alert("All fields are required.")
      return false
    }

    // Basic email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(email)) {
      event.preventDefault()
      alert("Please enter a valid email address.")
      return false
    }
  })
}

// Client-side validation for password form
const passwordForm = document.querySelector("#passwordForm")
if (passwordForm) {
  passwordForm.addEventListener("submit", function(event) {
    const password = document.getElementById("account_password").value
    const passwordPattern = /^(?=.*\d)(?=.*[A-Z])(?=.*[!@#$%^&*])[\da-zA-Z!@#$%^&*]{12,}$/

    if (!passwordPattern.test(password)) {
      event.preventDefault()
      alert("Password must be at least 12 characters and contain at least 1 uppercase letter, 1 number, and 1 special character.")
      return false
    }
  })
}