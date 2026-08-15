let isLoggedIn = false;
let isSubmitting = false;

async function loadProfile() {
    try {
        const res = await fetch("/api/user/data", {
            method: "GET",
            credentials: "include"
        });

        const data = await res.json();
        console.log(data);

        if (!data.success) {
            showMessage(data.message, "error");
            isLoggedIn = false;
            return;
        }

        isLoggedIn = true;
        document.getElementById("name").value = data.userData.name;
        document.getElementById("street").value = data.userData.address.street;
        document.getElementById("city").value = data.userData.address.city;
        document.getElementById("state").value = data.userData.address.state;
        document.getElementById("pincode").value = data.userData.address.pincode;

        document.getElementById("email").innerText = data.userData.email;

        // Render buttons dynamically based on verification status
        const btnsContainer = document.querySelector('.btns');

        if (data.userData.isAccountVerified) {
            document.getElementById("verifyStatus").innerText = "Verified";
            btnsContainer.innerHTML = `<button id="changeEmailBtn">Change Email</button>`;
        } else {
            document.getElementById("verifyStatus").innerText = "Not Verified";
            btnsContainer.innerHTML = `    
                <button id="changeEmailBtn">Change Email</button>
                <button id="verifyEmailBtn">Verify Email</button>
            `;
            // Attach event listener to newly created verify button
            document.getElementById('verifyEmailBtn').addEventListener('click', sendOtp);
        }

        document.getElementById('logoutBtn').addEventListener('click', logoutUser);

        document.getElementById('changeEmailBtn').addEventListener('click', () => {
            window.location.href = "/client/HTML/changeEmail/change.html";
        });

    } catch (err) {
        console.error(err);
        showMessage("Failed to load profile data", "error");
    }
}

async function sendOtp() {
    if (isSubmitting) return;

    const verifyBtn = document.getElementById('verifyEmailBtn');
    const originalText = verifyBtn.innerText;

    try {
        isSubmitting = true;
        
        // Show loader state on button
        verifyBtn.disabled = true;
        verifyBtn.innerText = "Sending OTP...";

        const otpResponse = await fetch('/api/auth/send-verify-otp', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                otpType: "verify-email"
            }),
            credentials: 'include'
        });

        const otpData = await otpResponse.json();

        if (otpData.success) {
            showMessage("OTP sent successfully to your email", "success");
            
            // Wait 2 seconds so the user sees the success message before redirecting
            setTimeout(() => {
                window.location.href = '../Register/verify-email.html';
            }, 2000);
        } else {
            showMessage(otpData.message || "Failed to send OTP", "error");
            console.log(otpData.message);
            
            // Reset button if request fails
            verifyBtn.disabled = false;
            verifyBtn.innerText = originalText;
        }
    } catch (err) {
        console.error(err);
        showMessage("Something went wrong. Please try again.", "error");
        
        // Reset button on network/client error
        verifyBtn.disabled = false;
        verifyBtn.innerText = originalText;
    } finally {
        isSubmitting = false;
    }
}

async function logoutUser() {
    try {
        const res = await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include"
        });

        const data = await res.json();

        if (data.success) {
            showMessage("Logged out successfully", "success");
            isLoggedIn = false;
            setTimeout(() => {
                window.location.href = "../index.html";
            }, 2000);
        }
    } catch (err) {
        console.error(err);
        showMessage("Failed to log out", "error");
    }
}

loadProfile();

// Profile update listener
document.getElementById("profileForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const street = document.getElementById("street").value;
    const city = document.getElementById("city").value;
    const state = document.getElementById("state").value;
    const pincode = document.getElementById("pincode").value;

    try {
        const response = await fetch("/api/user/update-data", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                name,
                address: { street, city, state, pincode }
            })
        });

        const data = await response.json();

        if (data.success) {
            showMessage("Profile updated successfully", "success");
            loadProfile();
        } else {
            showMessage(data.message || "Something went wrong", "error");
        }
    } catch (err) {
        console.error(err);
        showMessage("Failed to update profile", "error");
    }
});

// Protected links check
const protectedLinks = document.querySelectorAll(".protected");

protectedLinks.forEach(link => {
    link.addEventListener("click", function (e) {
        if (!isLoggedIn) {
            e.preventDefault();
            showMessage("Please login first", "error");
            setTimeout(() => {
                window.location.href = "/client/HTML/Login/login.html";
            }, 2000);
        }
    });
});