const menuMobile = document.getElementById("menu-mobile");
const menu = document.getElementById("menu");
const menuLinks = document.querySelectorAll(".menu a");
const contactForm = document.querySelector(".contact-form");

// Abrir e fechar menu mobile
menuMobile.addEventListener("click", () => {
    menu.classList.toggle("active");
    menuMobile.classList.toggle("active");
});

// Fechar menu ao clicar em algum link
menuLinks.forEach((link) => {
    link.addEventListener("click", () => {
        menu.classList.remove("active");
        menuMobile.classList.remove("active");
    });
});

// Simulação de envio do formulário
contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    alert("Thank you! Your message has been sent successfully.");

    contactForm.reset();
});