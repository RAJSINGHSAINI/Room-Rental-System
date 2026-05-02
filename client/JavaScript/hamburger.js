const hamburger = document.getElementById("hamburger");
const menu = document.querySelector(".ham-links");

hamburger.addEventListener("click", () => {
    menu.classList.toggle("active");
});

// Close menu when clicking a link
document.querySelectorAll(".ham-links a").forEach(link => {
    link.addEventListener("click", () => {
        menu.classList.remove("active");
    });
});