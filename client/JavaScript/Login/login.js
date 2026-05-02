const form = document.getElementById("loginForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return showMessage("Invalid email format");
    }


    const response = await fetch("http://192.168.0.120:8080/api/auth/login", {

        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",

        body: JSON.stringify({
            email,
            password
        })

    });

    const data = await response.json();

    if (data.success) {

        if (data.message === 'not-verified') {

            showMessage("Your account is not verified. Please verify your email.","error");

        }

        window.location.href = "../index.html";

    }
    else {

        message.innerText = data.message;

    }

});