const container = document.querySelector(".room-container");
const params = new URLSearchParams(window.location.search);
const homeID = params.get("id");

async function loadBooking() {

    const bookingResponse = await fetch(`http://192.168.0.120:8080/api/booking/get-home-bookings/${homeID}`, {
        method: "GET",
        credentials: 'include'
    });

    const bookingData = await bookingResponse.json();
    console.log(bookingData);

    if (!bookingData.success) {
        return showMessage(bookingData.message,"error");
    }

    container.innerHTML = ""; // clear before render

    bookingData.bookings.forEach(e => {

        container.innerHTML += `
        <div class="owner-booking-card">

            <!-- USER -->
            <div class="user-section">
                <h3 class="user-name">${e.name}</h3>
                <p class="user-email">${e.email}</p>
                <p class="user-phone">+91 ${e.phone}</p>
                 ${e.specialRequest
                ? `<p class="special-request"><strong>Request:</strong> ${e.specialRequest}</p>`
                : ''
            }
            </div>

            <!-- BOOKING -->
            <div class="booking-section">
                <p><strong>Check-In:</strong> ${e.checkInDate.split('T')[0]}</p>
                <p><strong>Check-Out:</strong> ${e.checkOutDate.split('T')[0]}</p>
                <p><strong>Total Days:</strong> ${e.totalDays}</p>
                <p><strong>Total Price:</strong> ₹${e.totalPrice}</p>
            </div>

            <!-- STATUS -->
            <div class="status-section">

                <label>Status</label>

                <h4>Current: ${e.status}</h4>
                <h5>  ${e.cancelledBy ? "Cancelled By:" + e.cancelledBy : ""} </h5>
                <select class="status-select" data-id="${e._id}">
                    <option value="confirmed" ${e.status === "confirmed" ? "selected" : ""}>Confirmed</option>
                    <option value="checked-in" ${e.status === "checked-in" ? "selected" : ""}>Checked-in</option>
                    <option value="completed" ${e.status === "completed" ? "selected" : ""}>Completed</option>
                    <option value="cancelled" ${e.status === "cancelled" ? "selected" : ""}>Cancelled</option>  
                </select>

                <button class="save-status-btn" data-id="${e._id}">Save</button>

            </div>

        </div>
        `;
    });
}

container.addEventListener("click", async (e) => {

    if (e.target.classList.contains("save-status-btn")) {

        const bookingId = e.target.dataset.id;

        const select = document.querySelector(`select[data-id="${bookingId}"]`);
        const newStatus = select.value;

        const currentStatus = select.parentElement.querySelector("h4").innerText.split(": ")[1];

        if (newStatus === currentStatus) {
            return showMessage("Status is already same");
        }

        try {
            const res = await fetch(`http://192.168.0.120:8080/api/booking/update-status/${bookingId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ status: newStatus })
            });

            const data = await res.json();

            showMessage(data.message,"error");

            if (data.success) {
                loadBooking();
            }

        } catch (err) {
            console.error(err);
            showMessage("Something went wrong","error");
        }
    }

});

loadBooking();