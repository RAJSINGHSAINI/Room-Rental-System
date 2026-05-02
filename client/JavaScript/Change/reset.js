document.getElementById("resetForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const OTP = document.getElementById("otp").value;
    const newEmail = localStorage.getItem("newEmail");

    const res = await fetch("http://192.168.0.120:8080/api/auth/verify-otp", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
            newEmail,
            OTP,
            type: 'change-email'
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