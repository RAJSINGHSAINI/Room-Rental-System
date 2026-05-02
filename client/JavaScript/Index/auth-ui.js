let isLoggedIn = false;

async function checkLogin() {

    try {

        const res = await fetch("http://192.168.0.120:8080/api/auth/is-auth", {
            method: "POST",
            credentials: "include"
        });

        const data = await res.json();
        console.log(data);
        
        if (data.success) {

            isLoggedIn = true;
            window.isLoggedIn = true;
            const authLink = document.querySelector(".authLink");
            const authLinkHam = document.querySelector(".authLink-ham");
            console.log(authLink);
            if (authLink || authLinkHam) {
                authLink.innerHTML =
                    `<a  href="/client/HTML/Profile/profile.html">👤 Profile</a>
                <button  id="logoutBtn">Logout</button>`;
                authLinkHam.innerHTML =
                    `<a  href="/client/HTML/Profile/profile.html">👤 Profile</a>
                <button  id="logoutBtn">Logout</button>`;
            }

            document.getElementById("logoutBtn").addEventListener("click", logoutUser);

        }

    } catch (err) {
        console.log(err);

        console.log("Not logged in");

    }

}

checkLogin();

// logout function

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

            window.location.href = `${window.location.origin}/client/HTML/index.html`;
        }, 3000);
    }

}


// protect pages

const protectedLinks = document.querySelectorAll(".protected");

protectedLinks.forEach(link => {

    link.addEventListener("click", function (e) {

        if (!isLoggedIn) {

            e.preventDefault();

            showMessage("Please login first", "info");
            setTimeout(() => {

                window.location.href = "/client/HTML/Login/login.html";
            }, 3000);

        }

    });

});


