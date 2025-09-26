
let email_el = document.getElementById("exampleInputEmail1")
let email_container = document.getElementById("email-container")
let submit_el = document.getElementById("submitBtn") 
let password_container = document.getElementById("password-container")
let password_el = document.getElementById("exampleInputPassword1")

submit_el.addEventListener("click", (e) => {
    e.preventDefault()
    let hasAtSign = email_el.value.includes('@')
    let isEmpty = email_el.value === "" 
    let isPasswordEmpty = password_el.value === "" 
    let hasDomain = email_el.value.includes('.com')

    console.log("password lenght: ", password_el.value.length)
    let validPasswordLength = password_el.value.length > 8

    console.log(email_el.value)
    console.log("has@sign: ", hasAtSign)
    console.log("isEmpty: ", isEmpty)
    if (hasAtSign && !isEmpty && hasDomain){
        email_el.style.border = "2px solid green"
    }else{
        email_el.style.border = "2px solid red"
    }
    

    console.log("hasValidPasswordLength : ", validPasswordLength)

    if (isPasswordEmpty ||!validPasswordLength){
        password_el.style.border = "2px solid red"
    }
})


