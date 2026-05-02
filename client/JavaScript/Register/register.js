let isSubmitting = false;
const form = document.getElementById("registerForm");
form.addEventListener("submit", async (e) => {
    
    e.preventDefault();
    if(isSubmitting) return;
    isSubmitting = true;
    
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const street = document.getElementById("street").value;
    const city = document.getElementById("city").value;
    const state = document.getElementById("state").value;
    const pincode = document.getElementById("pincode").value;
    const password = document.getElementById("password").value;
    if(password.length < 8) {
        showMessage("Password must be at least 8 characters long", "error");
        return;
    } else if(password.length > 20) {
        showMessage("Password cannot be more than 20 characters long", "error");
        return;
    } else if(password.includes(" ")) {
        showMessage("Password cannot contain spaces", "error");
        return;
    } else if(!/[A-Za-z]/.test(password)) {
        showMessage("Password must contain at least one letter", "error");
        return;
    }
    
    try {
        document.getElementById("registerFormbtn").disabled = true;

        const response = await fetch("http://192.168.0.120:8080/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                name,
                email,
                password,
                address: {
                    street,
                    city,
                    state,
                    pincode
                }
            })
        });

        const data = await response.json();
        console.log(data)
        if (!data.success) {
            showMessage(data.message,"error");
            return;
        }

    

        // Send OTP after successful registration
    
        const otpResponse = await fetch("http://192.168.0.120:8080/api/auth/send-verify-otp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }, body: JSON.stringify({
                otpType: "verify-email"
            }),
            credentials: "include"
        });

        const otpData = await otpResponse.json();
        console.log(otpData)

        if (otpData.success) {

            showMessage("OTP sent to your email","success");
            setTimeout(() => {
                
                window.location.href = "verify-email.html";
            }, 3000);

        } else {

            showMessage(otpData.message,"error");

        }

    } catch (error) {

        console.error("Error:", error);

        showMessage("Something went wrong. Please try again.","error");

    } finally {
        isSubmitting = false;
        document.getElementById("registerFormbtn").disabled = false;
    }

});