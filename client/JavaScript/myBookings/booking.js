const container = document.querySelector('.current-booking');
const Hcontainer = document.querySelector('.history-booking');

let selectedBookingId = null;
let bookingsData = [];

async function getAllBookings() {
    const res = await fetch('http://192.168.0.120:8080/api/booking/get-all-bookings', {
        method: 'GET',
        credentials: 'include',
    });

    const data = await res.json();

    if (!data.success) {
        return showMessage(data.message,"error");
    }

    bookingsData = data.bookings;
    renderBookings(bookingsData);
}

function renderBookings(bookings) {


    Hcontainer.innerHTML = ''
    container.innerHTML = ''


    bookings.forEach(e => {

        if (e.status === "cancelled" || e.status === 'completed') {


            Hcontainer.innerHTML += `
            <div class="booking-card">
            
            <img src="http://192.168.0.120:8080/uploads/${e.home.coverImage}" class="booking-img">
            
            <div class="booking-content">
            
            <h3 class="room-title">${e.home.title}</h3>
            <p class="location">📍 ${e.home.address.city}</p>

            <div class="booking-info">
            <p><strong>Check-In:</strong> ${e.checkInDate.split('T')[0]}</p>
            <p><strong>Check-Out:</strong> ${e.checkOutDate.split('T')[0]}</p>
            <p><strong>Total Days:</strong> ${e.totalDays}</p>
            </div>
            
            <div class="price-status">
            <span class="price">₹${e.totalPrice}</span>
            <div>
            <button class="style-btn detail-btn" data-id="${e._id}">Details</button>
            <span class="status ${e.status}">${e.status}</span>
            </div>
            </div>
            
            ${e.status === 'confirmed'
                    ? `<button class="cancel-btn" data-id="${e._id}">Cancel Booking</button>`
                    : `<button class="cancel-btn disabled" disabled>${e.status}</button>`
                }
                
                </div>
                </div>
                `;
        } else {
            container.innerHTML += `
                <div class="booking-card">
                
                <img src="http://192.168.0.120:8080/uploads/${e.home.coverImage}" class="booking-img">
                
                <div class="booking-content">
                
                <h3 class="room-title">${e.home.title}</h3>
                <p class="location">📍 ${e.home.address.city}</p>
    
                <div class="booking-info">
                <p><strong>Check-In:</strong> ${e.checkInDate.split('T')[0]}</p>
                <p><strong>Check-Out:</strong> ${e.checkOutDate.split('T')[0]}</p>
                <p><strong>Total Days:</strong> ${e.totalDays}</p>
                </div>
                
                <div class="price-status">
                <span class="price">₹${e.totalPrice}</span>
                <div>
                <button class="style-btn detail-btn" data-id="${e._id}">Details</button>
                <span class="status confirmed">${e.status}</span>
                </div>
                </div>
                
                ${e.status === 'confirmed'
                    ? `<button class="cancel-btn" data-id="${e._id}">Cancel Booking</button>`
                    : `<button class="cancel-btn disabled" disabled>${e.status}</button>`
                }
                    
                    </div>
                    </div>
                    `;

        }
    });

    if (Hcontainer.innerHTML === '') {

        Hcontainer.innerHTML = '<h4 class = "h4-message" >No History Booking</h4>'
    }
    if (container.innerHTML === '') {
        container.innerHTML = '<h4 class = "h4-message" >No Current Booking</h4>'

    }

}

// EVENT DELEGATION 
[container, Hcontainer].forEach(parent => {

    parent.addEventListener('click', (e) => {

        const id = e.target.dataset.id;

        // DETAILS
        if (e.target.classList.contains('detail-btn')) {
            const booking = bookingsData.find(b => b._id === id);
            openDetailsModal(booking);
        }

        // CANCEL
        if (e.target.classList.contains('cancel-btn') && !e.target.disabled) {
            openCancelModal(id);
        }
    });

})
//  DETAILS MODAL 
function openDetailsModal(booking) {
    document.getElementById("detailsModal").style.display = "flex";

    document.getElementById("m-title").innerText = booking.home.title;
    document.getElementById("m-description").innerText = booking.home.description;

    document.getElementById("m-owner-name").innerText = booking.home.ownerName || "N/A";
    document.getElementById("m-owner-email").innerText = booking.home.contact || "N/A";

    document.getElementById("m-checkin").innerText = new Date(booking.checkInDate).toDateString();
    document.getElementById("m-checkout").innerText = new Date(booking.checkOutDate).toDateString();
    document.getElementById("m-days").innerText = booking.totalDays;
    document.getElementById("m-price").innerText = booking.totalPrice;

    document.getElementById("m-user-name").innerText = booking.name;
    document.getElementById("m-user-email").innerText = booking.email;
    document.getElementById("m-phone").innerText = booking.phone;

    document.getElementById("m-request").innerText = booking.specialRequest || "No request";
}

function closeDetailsModal() {
    document.getElementById("detailsModal").style.display = "none";
}

//  CANCEL MODAL 
function openCancelModal(id) {
    selectedBookingId = id;
    document.getElementById("cancelModal").style.display = "flex";
}

function closeCancelModal() {
    document.getElementById("cancelModal").style.display = "none";
}

// CANCEL BOOKING 
document.getElementById("cancelConfirm").addEventListener("click", async () => {

    document.getElementById("cancelConfirm").disabled = true;
    if (!selectedBookingId) return;

    const res = await fetch('http://192.168.0.120:8080/api/booking/cancel-booking', {
        method: 'PUT',
        headers: {
            "Content-Type": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify({
            cancelledBy: 'user',
            bookID: selectedBookingId
        })
    });

    const data = await res.json();

    showMessage(data.message,"success");

    if (data.success) {
        closeCancelModal();
        getAllBookings();
    }
});

getAllBookings();