let isLoggedIn = false;
let isSubmitting = false;

async function loadProfile() {

    const res = await fetch("http://192.168.0.120:8080/api/user/data", {
        method: "GET",
        credentials: "include"
    })

    const data = await res.json()

    console.log(data);

    if (!data.success) {
        showMessage(data.message, "error");
        isLoggedIn = false;
        return;
    }

    isLoggedIn = true;
    document.getElementById("name").value = data.userData.name
    document.getElementById("street").value = data.userData.address.street
    document.getElementById("city").value = data.userData.address.city
    document.getElementById("state").value = data.userData.address.state
    document.getElementById("pincode").value = data.userData.address.pincode

    document.getElementById("email").innerText = data.userData.email

    if (data.userData.isAccountVerified) {
        document.getElementById("verifyStatus").innerText = "Verified"
        document.querySelector('.btns').innerHTML = `<button id="changeEmailBtn">Change Email</button>`
    } else {
        document.getElementById("verifyStatus").innerText = "Not Verified"
        document.querySelector('.btns').innerHTML = `    
        <button id="changeEmailBtn">Change Email</button>
        <button id="verifyEmailBtn">Verify Email</button>
        
        `
        document.getElementById('verifyEmailBtn').addEventListener('click', sendOtp)
    }
    document.getElementById('logoutBtn').addEventListener('click', logoutUser)

    document.getElementById('changeEmailBtn').addEventListener('click', () => {
        window.location.href = "/client/HTML/changeEmail/change.html";
    })
    async function logoutUser() {

        const res = await fetch("http://192.168.0.120:8080/api/auth/logout", {

            method: "POST",

            credentials: "include"

        });

        const data = await res.json();

        if (data.success) {

            showMessage("Logged out successfully", "success");

            isLoggedIn = false;
            setTimeout(() => {

                window.location.href = "../index.html";
            }, 3000);

        }

    }


    async function sendOtp() {

        try {
            if (isSubmitting) return;
            isSubmitting = true;
            document.getElementById('verifyEmailBtn').disabled = true;
            const otpResponse = await fetch('http://192.168.0.120:8080/api/auth/send-verify-otp', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    otpType: "verify-email"
                }),
                credentials: 'include'
            })

            const otpData = await otpResponse.json();

            if (otpData.success) {
                window.location.href = '../Register/verify-email.html'
            } else {
                showMessage("something went wrong", "error");
                console.log(otpData.message);

            }
        } catch (err) {
            console.error(err);
            showMessage("something went wrong", "error");
        } finally {
            isSubmitting = false;
            document.getElementById('verifyEmailBtn').disabled = false;
        }
    }
}

loadProfile()



// update profile

document.getElementById("profileForm").addEventListener("submit", async (e) => {

    e.preventDefault()

    const name = document.getElementById("name").value

    const street = document.getElementById("street").value
    const city = document.getElementById("city").value
    const state = document.getElementById("state").value
    const pincode = document.getElementById("pincode").value

    const response = await fetch("http://192.168.0.120:8080/api/user/update-data", {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        credentials: "include",

        body: JSON.stringify({

            name,

            address: {
                street,
                city,
                state,
                pincode
            }

        })

    })

    const data = await response.json();

    if (data.success) {
        showMessage("Profile updated", "success")
        loadProfile()
    } else {
        showMessage("Something went wrong", "error")
        console.log(data.message);

    }


})



const protectedLinks = document.querySelectorAll(".protected");

protectedLinks.forEach(link => {

    link.addEventListener("click", function (e) {

        if (!isLoggedIn) {

            e.preventDefault();

            showMessage("Please login first");
            setTimeout(() => {

                window.location.href = "/client/HTML/Login/login.html";
            }, 3000);

        }

    });

});
