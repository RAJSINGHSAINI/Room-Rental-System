let isSubmitting = false;

document.getElementById("changeForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    if (isSubmitting) return; 
    isSubmitting = true;

    const btn = document.querySelector("#changeForm button[type='submit']");
    btn.disabled = true;

    const newEmail = document.getElementById("email").value.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
        showMessage("Invalid email format", "error");
        isSubmitting = false;
        btn.disabled = false;
        btn.innerText = "Submit";
        return;
    }

    try {
        const res = await fetch("http://192.168.0.120:8080/api/auth/send-verify-otp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ newEmail, otpType: 'change-email' })
        });

        const data = await res.json();

        if (data.success) {
            localStorage.setItem("resetEmail", newEmail);
            window.location.href = "reset.html";
        } else {
            document.getElementById("message").innerText = data.message;
        }

    } catch (err) {
        console.error(err);
        showMessage("Something went wrong", "error");
    } finally {
        isSubmitting = false; 
        btn.disabled = false;
        btn.innerText = "Submit";
    }
});