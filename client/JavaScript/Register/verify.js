const form = document.getElementById("verifyForm");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const OTP = document.getElementById("otp").value;

    const response = await fetch("/api/auth/verify-otp", {

        method: "POST",
        credentials: "include",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            OTP,
            type: 'verify-email'
        })

    });

    const data = await response.json();

    if (data.success) {

        showMessage("Account verified!","success");
        setTimeout(() => {
            
            window.location.href = "../Login/login.html";
        }, 3000);

    } else {
        console.log(data);

        showMessage("Invalid OTP","error");

    }

});