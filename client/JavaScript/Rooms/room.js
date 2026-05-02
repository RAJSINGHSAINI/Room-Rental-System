const params = new URLSearchParams(window.location.search);
const id = params.get("id");
async function loadHome() {
  try {
    const res = await fetch(`http://192.168.0.120:8080/api/home/get-home/${id}`, {
      credentials: 'include'
    });
    const data = await res.json();

    const home = data.home;

    const baseURL = "http://192.168.0.120:8080/uploads/";

    console.log(data);


    // Cover Image
    document.getElementById("coverImage").src = baseURL + home.coverImage;

    // Basic Info
    document.getElementById("title").innerText = home.title;
    document.getElementById("name").innerText = home.ownerName;
    document.getElementById("contact").innerText = home.contact;
    document.getElementById("location").innerText = `${home.address?.city}, ${home.address?.street}, ${home.address?.state}
      pin- ${home.address.pincode}
      `;
    document.getElementById("description").innerText = home.description;

    // Property Info
    document.getElementById("bedrooms").innerText = home.bedrooms;
    document.getElementById("bathrooms").innerText = home.bathrooms;
    document.getElementById("guests").innerText = home.maxGuests;

    // Price
    document.getElementById("price").innerText = `₹${home.pricePerNight} / night`;

    // Gallery Images
    const gallery = document.getElementById("gallery");
    home.images.forEach(img => {
      const image = document.createElement("img");
      image.src = baseURL + img;
      gallery.appendChild(image);
    });

    if (!window.isLoggedIn) {
      showMessage("Not Logged In", "error")
      document.getElementById("book-btn").disabled = true;
    }

  } catch (err) {
    console.error(err);
    showMessage("Error loading home", "error");
  }
}

loadHome();

document.getElementById('book-btn').addEventListener('click', async () => {
  const res = await fetch(`http://192.168.0.120:8080/api/home/check-lists-home/${id}`, {
    method: "GET",
    credentials: "include",
  });

  const data = await res.json();

  if (!data.success) {
    showMessage(data.message, "error");
    return;
  }
  window.location.href = `../Booking/booking.html?id=${id}`;
})