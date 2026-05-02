document.getElementById("resetForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const otp = document.getElementById("otp").value;
    const newPassword = document.getElementById("newPassword").value;
    const email = localStorage.getItem("resetEmail");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return showMessage("Invalid email format");
    }
    if (newPassword.length < 8) {
        showMessage("Password must be at least 8 characters long", "error");
        return;
    } else if (newPassword.length > 20) {
        showMessage("Password cannot be more than 20 characters long", "error");
        return;
    } else if (newPassword.includes(" ")) {
        showMessage("Password cannot contain spaces", "error");
        return;
    } else if (!/[A-Za-z]/.test(newPassword)) {
        showMessage("Password must contain at least one letter", "error");
        return;
    }

    const res = await fetch("http://192.168.0.120:8080/api/auth/reset-password", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email,
            otp,
            newPassword
        })
    });

    const data = await res.json();

    if (data.success) {
        localStorage.removeItem("resetEmail");
        document.querySelector('.message').style = 'color: green;'
        document.querySelector('.message').innerText = data.message;
        setTimeout(() => {
            document.querySelector('.message').innerText = ''
            window.location.href = "../Login/login.html";
        }, 1200);
    } else {
        document.querySelector(".message").innerText = data.message;
        document.querySelector('.message').style = 'color: red;'
        document.querySelector('.message').innerText = data.message;
        setTimeout(() => {
            document.querySelector('.message').innerText = ''

        }, 1200);
    }
});