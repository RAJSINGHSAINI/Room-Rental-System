const form = document.getElementById('roomForm');

form.addEventListener('submit', addHome);



// Cover preview
document.getElementById("coverImage").addEventListener("change", (e) => {
    const file = e.target.files[0];
    const preview = document.getElementById("coverPreview");

    preview.innerHTML = "";
    if (file) {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        preview.appendChild(img);
    }
});

// Multiple images preview
document.getElementById("images").addEventListener("change", (e) => {
    const files = e.target.files;
    const preview = document.getElementById("imagesPreview");

    preview.innerHTML = "";


    //Take only 5 images
    const limitedFiles = Array.from(files).slice(0, 5);

    limitedFiles.forEach(file => {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        preview.appendChild(img);
    });
});



async function addHome(e) {
    e.preventDefault();

    const imageFiles = document.getElementById("images").files;

    if (imageFiles.length > 5) {
        showMessage("You can upload maximum 5 images only");
        return;
    }

    const formData = new FormData(form);
    console.log(formData);

    try {
        const response = await fetch("http://192.168.0.120:8080/api/home/add-home", {
            method: "POST",
            body: formData,
            credentials: "include"
        });

        const data = await response.json();

        if (data.success) {
            showMessage("Home added successfully", "success");
            form.reset(); // clear form
            location.reload(); // refresh after delete
        } else {
            showMessage(data.message, "error");
        }

    } catch (error) {
        console.error(error);
        showMessage("Something went wrong", "error");
    }
}

function cardTemplate(home) {
    return `
<div class="home-card">

<!--  Cover Image -->
<div class="home-image">
    <img src="http://192.168.0.120:8080/uploads/${home.coverImage}" alt="Home Image">
    <span class="price">${home.pricePerNight}/ night</span>
</div>

<div class="home-content">
    <h2 class="title">${home.title}</h2>
    <p class="location">${home.address.street} ${home.address.city} ${home.address.state} ${home.address.pincode}</p>

    <p class="description">${home.description}</p>

    <!--  Info -->
    <div class="home-info">
        <span> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M320 312C386.3 312 440 258.3 440 192C440 125.7 386.3 72 320 72C253.7 72 200 125.7 200 192C200 258.3 253.7 312 320 312zM290.3 368C191.8 368 112 447.8 112 546.3C112 562.7 125.3 576 141.7 576L498.3 576C514.7 576 528 562.7 528 546.3C528 447.8 448.2 368 349.7 368L290.3 368z"/></svg> ${home.maxGuests}</span>
        <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M64 96C81.7 96 96 110.3 96 128L96 352L320 352L320 224C320 206.3 334.3 192 352 192L512 192C565 192 608 235 608 288L608 512C608 529.7 593.7 544 576 544C558.3 544 544 529.7 544 512L544 448L96 448L96 512C96 529.7 81.7 544 64 544C46.3 544 32 529.7 32 512L32 128C32 110.3 46.3 96 64 96zM144 256C144 220.7 172.7 192 208 192C243.3 192 272 220.7 272 256C272 291.3 243.3 320 208 320C172.7 320 144 291.3 144 256z"/></svg> ${home.bedrooms}</span>
        <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M160 141.3C160 134 165.9 128 173.3 128C176.8 128 180.2 129.4 182.7 131.9L197.6 146.8C194 155.9 192.1 165.7 192.1 176C192.1 195.9 199.3 214 211.3 228C206 237.2 207.3 249.1 215.1 257C224.5 266.4 239.7 266.4 249 257L353 153C362.4 143.6 362.4 128.4 353 119.1C345.2 111.2 333.2 110 324 115.3C310 103.3 291.9 96.1 272 96.1C261.7 96.1 251.8 98.1 242.8 101.6L227.9 86.6C213.4 72.1 193.7 64 173.3 64C130.6 64 96 98.6 96 141.3L96 320C78.3 320 64 334.3 64 352C64 369.7 78.3 384 96 384L96 432C96 460.4 108.4 486 128 503.6L128 544C128 561.7 142.3 576 160 576C177.7 576 192 561.7 192 544L192 528L448 528L448 544C448 561.7 462.3 576 480 576C497.7 576 512 561.7 512 544L512 503.6C531.6 486 544 460.5 544 432L544 384C561.7 384 576 369.7 576 352C576 334.3 561.7 320 544 320L160 320L160 141.3z"/></svg> ${home.bathrooms}</span>
    </div>

    <!--  Rating + Status -->
    <div class="home-footer">
        <span class="status ${home.isAvailable ? 'available' : 'not-available'}">${home.isAvailable ? 'Available' : 'Not Available'}
</span>
    </div>

    <div class="card-actions">
            <button class="edit-btn" onclick ="window.location.href = 'edit-room.html?id=${home._id}'" >✏️ Edit</button>
            <button class="delete-btn" onclick="delHome('${home._id}')" >🗑 Delete</button>
    </div>
</div>

</div>
`
}
async function getRooms() {

    const response = await fetch("http://192.168.0.120:8080/api/home/get-homes", {
        method: "GET",
        credentials: "include"
    })

    const data = await response.json();
    const container = document.getElementById('home-container')

    if (!data.success) {
        showMessage(data.message, "error");
        return;
    }
    if (data.homes.length === 0) {
        return container.innerHTML = 'No Homes Added Yet';
    }

    container.innerHTML = '';

    data.homes.forEach(e => {
        console.log(e);

        container.innerHTML += cardTemplate(e)
    });



}
getRooms();




async function logoutUser() {

    const res = await fetch("http://192.168.0.120:8080/api/auth/logout", {

        method: "POST",

        credentials: "include"

    });

    const data = await res.json();

    if (data.success) {

        showMessage("Logged out successfully", "success");
        setTimeout(() => {
            window.location.href = "../index.html";
        }, 3000);

    }

}

document.getElementById('logout').addEventListener('click', logoutUser);

async function delHome(homeId) {

    const modal = document.createElement('div');
    modal.classList.add('modal');

    modal.innerHTML = `
        <div class="modal-box">
            <h3>Delete Home</h3>
            <p>Are you sure you want to delete this home?</p>

            <div class="modal-actions">
                <button class="cancel-btn">Cancel</button>
                <button class="delete-btn">Delete</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Cancel button
    modal.querySelector('.cancel-btn').onclick = () => {
        modal.remove();
    };

    // Delete button
    modal.querySelector('.delete-btn').onclick = async () => {
        try {
            const delResponse = await fetch(`http://192.168.0.120:8080/api/home/del-home/${homeId}`, {
                method: "DELETE",
                credentials: "include"
            });
            const delData = await delResponse.json();

            if (delData.success) {
                showMessage(delData.message, "error")
            } else {
                showMessage(delData.message, "error")
            }

            modal.remove();
            location.reload(); // refresh after delete
        } catch (err) {
            console.log(err);
        }
    };
}


async function loadAllBookedRooms() {

    const bookedResponse = await fetch('http://192.168.0.120:8080/api/booking/get-owner-home-bookings', {
        method: 'GET',
        credentials: 'include'
    })

    const bookedData = await bookedResponse.json();
    console.log(bookedData);

    const bookContainer = document.querySelector('.booked-room-container');
    if (!bookedData.success) {
        bookContainer.innerHTML = 'No Homes Booked Yet';
        return showMessage(bookedData.message, "error")
    }


    bookContainer.innerHTML = ''
    bookedData.homes.forEach(home => {
        bookContainer.innerHTML += `
            <div class=" home-card rented-room">
                    <div class="wrap-up">

                        <div class="cover-image">
                            <img src="http://192.168.0.120:8080/uploads/${home.coverImage}" alt="">
                        </div>

                        <div class="rent-info ">

    <h4 class="home-title">${home.title}</h4>

    <div class="stats-row">

        <div class="stat-box">
            <p>Revenue</p>
            <h3>₹${home.totalPrice}</h3>
        </div>

        <div class="stat-box">
            <p>Bookings</p>
            <h3>${home.totalBookings}</h3>
        </div>

        <div class="stat-box">
            <p>Days</p>
            <h3>${home.totalDays}</h3>
        </div>

        <div class="stat-box active">
            <p>Active</p>
            <h3>${home.activeBookings}</h3>
        </div>

        <div class="stat-box completed">
            <p>Completed</p>
            <h3>${home.completedBookings}</h3>
        </div>

        <div class="stat-box cancelled">
            <p>Cancelled</p>
            <h3>${home.cancelledBookings}</h3>
        </div>

    </div>

</div>
</div>
                    <div class=" flex-align-center see-more" >
                        <button id="details" onclick ="window.location.href = '../myRentedRooms/index.html?id=${home._id}'">See Details</button>
                    </div>
        `
    })

}

loadAllBookedRooms()