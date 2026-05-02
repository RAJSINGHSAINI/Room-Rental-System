let pricePerNight = 0;

const params = new URLSearchParams(window.location.search);
const homeID = params.get("id");

async function getHome() {
    try {
        const response = await fetch(`http://192.168.0.120:8080/api/home/get-home/${homeID}`, {
            method: "GET",
            credentials: "include"
        });

        const data = await response.json();

        if (!data.success) {
            showMessage(data.message,"success");
            return;
        }

        const home = data.home;
        pricePerNight = home.pricePerNight;

        document.getElementById('title').innerText = home.title;
        document.getElementById('coverImage').src = `http://192.168.0.120:8080/uploads/${home.coverImage}`;
        document.getElementById('price').innerText = `${home.pricePerNight}/Night`;
        document.getElementById('pricePerNight').innerText = `${home.pricePerNight}`;
        document.getElementById('location').innerText =
            `${home.address.street}, ${home.address.city}, ${home.address.state}`;
        document.getElementById('bedrooms').innerText = `${home.bedrooms} Bedrooms`;
        document.getElementById('bathrooms').innerText = `${home.bathrooms} Bathrooms`;
        document.getElementById('maxGuests').innerText = `${home.maxGuests} Max Guests`;

        const guestInput = document.getElementById('guests');
        guestInput.placeholder = `Maximum ${home.maxGuests} guests allowed`;
        guestInput.max = home.maxGuests;

        // Guest validation
        guestInput.addEventListener("input", function () {
            if (this.value > home.maxGuests) {
                this.value = home.maxGuests;
                showMessage(`Maximum ${home.maxGuests} guests allowed`,"info");
            }
            if (this.value < 1) {
                this.value = 1;
            }
        });

    } catch (error) {
        console.log(error.message);
        showMessage("Failed to load home details","error");
    }
}
getHome();

const totalDaysEl = document.getElementById("totalDays");
const totalPriceEl = document.getElementById("totalPrice");

const checkIn = document.getElementById("checkIn");
const checkOut = document.getElementById("checkOut");

const today = new Date().toISOString().split("T")[0];
checkIn.min = today;
checkOut.min = today;

function calculatePrice() {
    if (!checkIn.value || !checkOut.value) return;

    const inDate = new Date(checkIn.value);
    const outDate = new Date(checkOut.value);

    if (outDate <= inDate) {
        totalDaysEl.innerText = 0;
        totalPriceEl.innerText = "₹0";
        return;
    }

    const days = Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24));
    totalDaysEl.innerText = days;
    totalPriceEl.innerText = "₹" + (days * pricePerNight);
}

checkIn.addEventListener("change", function () {
    const selectedDate = new Date(this.value);
    selectedDate.setDate(selectedDate.getDate() + 1);

    const minCheckout = selectedDate.toISOString().split("T")[0];

    checkOut.value = "";
    checkOut.min = minCheckout;

    calculatePrice();
});

checkOut.addEventListener("change", calculatePrice);

document.getElementById("bookingForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    try {
        // Get values
        const name = document.getElementById("name").value.trim();
        const checkInDate = checkIn.value;
        const checkOutDate = checkOut.value;
        const guests = document.getElementById("guests").value;
        const email = document.querySelector("input[name='email']").value.trim();
        const phone = document.querySelector("input[name='phone']").value.trim();
        const request = document.querySelector("textarea[name='request']").value.trim();


        if (!name) return showMessage("Name is required","info");

        if (!checkInDate || !checkOutDate) {
            return showMessage("Please select both dates","info");
        }

        if (new Date(checkOutDate) <= new Date(checkInDate)) {
            return showMessage("Check-Out must be after Check-In","info");
        }

        if (!guests || guests < 1) {
            return showMessage("Guests must be at least 1","info");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return showMessage("Invalid email format","info");
        }

        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(phone)) {
            return showMessage("Invalid phone number","info");
        }

        if (request.length > 200) {
            return showMessage("Special request too long (max 200 chars)","info");
        }


        const formData = {
            homeID,
            name,
            checkInDate,
            checkOutDate,
            guests,
            email,
            phone,
            request
        };

        const btn = document.querySelector(".book-btn");
        btn.disabled = true;
        btn.innerText = "Booking...";

        const response = await fetch('http://192.168.0.120:8080/api/booking/book', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData),
            credentials: 'include'
        });

        const data = await response.json();

        if (!data.success) {
            btn.disabled = false;
            btn.innerText = "Confirm Booking";
            return showMessage(data.message,"error");
        }

        // Success
        document.getElementById("successModal").style.display = "flex";

    } catch (error) {
        showMessage("Something went wrong","error");
    }
});

function closeModal() {
    document.getElementById("successModal").style.display = "none";
    window.location.href = '../index.html';
}