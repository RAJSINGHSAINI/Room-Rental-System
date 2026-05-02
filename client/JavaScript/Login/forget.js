let isSubmitting = false;

document.getElementById("forgotForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    if (isSubmitting) return; 
    isSubmitting = true;

    const email = document.getElementById("email").value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        isSubmitting = false;
        return showMessage("Invalid email format");
    }

    try {
        const res = await fetch("http://192.168.0.120:8080/api/auth/send-reset-otp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
        });

        const data = await res.json();

        if (data.success) {
            localStorage.setItem("resetEmail", email);
            window.location.href = "reset.html";
        } else {
            document.getElementById("message").innerText = data.message;
        }

    } catch (err) {
        console.error(err);
    } finally {
        isSubmitting = false;
    }
});