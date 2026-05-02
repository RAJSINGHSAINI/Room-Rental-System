
async function getHomes() {

    const response = await fetch("http://192.168.0.120:8080/api/home/get-wish-homes", {
        method: "GET",
        credentials: "include"
    })

    const data = await response.json();
    if (!data.success) {
        showMessage(data.message,"error");
        return;
    }
    console.log(data);

    const homes = data.homes
        .filter(home => home.isAvailable)
        .map(home => ({
            _id: home._id,
            title: home.title,
            pricePerNight: home.pricePerNight,
            bedrooms: home.bedrooms,
            coverImage: home.coverImage,
            address: home.address
        }));

    // const homes = [
    //     {
    //         title: "Cozy Apartment",
    //         price: 1500,
    //         bedrooms: 2,
    //         image: "https://via.placeholder.com/400x200"
    //     },
    //     {
    //         title: "Luxury Villa",
    //         price: 3000,
    //         bedrooms: 4,
    //         image: "https://via.placeholder.com/400x200"
    //     }
    // ];



    const container = document.getElementById("home-container");

    homes.forEach(home => {
        const card = document.createElement("div");
        card.className = "home-card";

        card.innerHTML = `
    <div class="home-image">
    <img src="http://192.168.0.120:8080/uploads/${home.coverImage}">
    <div class="price">₹${home.pricePerNight}/night</div>
    </div>
    
    <div class="home-content">
    <div class="title">${home.title}</div>
    <div class="location"><svg style="width: 20px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M128 252.6C128 148.4 214 64 320 64C426 64 512 148.4 512 252.6C512 371.9 391.8 514.9 341.6 569.4C329.8 582.2 310.1 582.2 298.3 569.4C248.1 514.9 127.9 371.9 127.9 252.6zM320 320C355.3 320 384 291.3 384 256C384 220.7 355.3 192 320 192C284.7 192 256 220.7 256 256C256 291.3 284.7 320 320 320z"/></svg> ${home.address.city || 'Unknown City'}</div>
    <div style="display:flex; flex-direction:column" >
    <div class="bedrooms">🛏 ${home.bedrooms} Bedrooms</div>
    <button id="wish-btn" data='${home._id}' class="book-btn">Remove to Wishlist</button>
    </div>
    
    <div class="card-actions">
    <button class="details-btn" onclick ="window.location.href = '../Rooms/room.html?id=${home._id}'" >More Details</button>
    <button id= "book-button" data="${home._id}" class="book-btn">Book Now</button>
    </div>
    </div>
    `;

        container.appendChild(card);
    });

    document.querySelectorAll('#book-button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const homeID = e.target.attributes.data.value;
            handleBooking(homeID);
        });
    });
    document.querySelectorAll('#wish-btn').forEach(e => {
        e.addEventListener('click', (e) => {
            removeWish(e.target.attributes.data.value)

        })
    })
}

getHomes();

async function removeWish(homeID) {

    const wishResponse = await fetch('http://192.168.0.120:8080/api/user/wish', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify({
            homeID,
            type: "remove"
        })
    })

    const wishData = await wishResponse.json();

    if (!wishData.success) {
        return showMessage(wishData.message,"error");
    }
    window.location.reload()
    return showMessage(wishData.message,"error");

}


async function handleBooking(homeID) {

    try {
        console.log(homeID);

        const res = await fetch(`http://192.168.0.120:8080/api/home/check-lists-home/${homeID}`, {
            method: "GET",
            credentials: "include",
        });

        const data = await res.json();

        if (!data.success) {
            showMessage(data.message,"error");
            return;
        }
        window.location.href = `../Booking/booking.html?id=${homeID}`;

    } catch (error) {
        console.log(error);

        showMessage("Something went wrong","error");
    }
}