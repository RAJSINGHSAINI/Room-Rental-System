
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


const params = new URLSearchParams(window.location.search);
const homeID = params.get("id");

console.log(homeID.toString());

fillHomeDetails(homeID)
async function fillHomeDetails(homeID) {
    try {
        const response = await fetch(`http://192.168.0.120:8080/api/home/get-home/${homeID}`, {
            method: "GET",
            credentials: "include"
        });

        const data = await response.json();
        console.log(data);

        if (!data.success) {
            showMessage(data.message,"error");
            return;
        }

        const home = data.home;

        // Basic Info
        document.getElementById("title").value = home.title || "";
        document.getElementById("name").value = home.ownerName || "";
        document.getElementById("description").value = home.description || "";
        document.getElementById("price").value = home.pricePerNight || "";

        // Address
        document.getElementById("street").value = home.address?.street || "";
        document.getElementById("city").value = home.address?.city || "";
        document.getElementById("state").value = home.address?.state || "";
        document.getElementById("pincode").value = home.address?.pincode || "";
        document.getElementById("contact").value = home.contact || "";

        // Room Details
        document.getElementById("guests").value = home.maxGuests || "";
        document.getElementById("bedrooms").value = home.bedrooms || "";
        document.getElementById("bathrooms").value = home.bathrooms || "";

        // Availability
        document.getElementById("available").checked = home.isAvailable || false;

        //  Cover Image Preview
        const coverPreview = document.getElementById("coverPreview");
        coverPreview.innerHTML = "";

        if (home.coverImage) {
            const img = document.createElement("img");
            img.src = `http://192.168.0.120:8080/uploads/${home.coverImage}`;
            coverPreview.appendChild(img);
        }

        //  Other Images Preview
        const imagesPreview = document.getElementById("imagesPreview");
        imagesPreview.innerHTML = "";

        if (home.images && home.images.length > 0) {
            home.images.forEach(image => {
                const img = document.createElement("img");
                img.src = `http://192.168.0.120:8080/uploads/${image}`;
                imagesPreview.appendChild(img);
            });
        }

    } catch (error) {
        console.error("Error loading home:", error);
        showMessage("Failed to load home details","error");
    }
}

const form = document.getElementById('editForm');
form.addEventListener('submit', e => {
    e.preventDefault()

    const imageFiles = document.getElementById("images").files;
    if (imageFiles.length > 5) {
        showMessage("You can upload maximum 5 images only");
        return;
    }
    const formData = new FormData(form)
    formData.append("homeID", homeID)
    saveHomeDetails(formData)
    console.log(formData);
})
async function saveHomeDetails(form) {

    const saveResponse = await fetch("http://192.168.0.120:8080/api/home/save-home", {
        method: "PUT",
        body: form,
        credentials: "include"
    })

    const saveData = await saveResponse.json()
    if (!saveData.success) {
        showMessage(saveData.message,"success");
    } else {
        showMessage(saveData.message,"error");
    }
    window.location.href = "rent-room.html"
}