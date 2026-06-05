const menuMobile = document.getElementById("menu-mobile");
const menu = document.getElementById("menu");
const menuLinks = document.querySelectorAll(".menu a");
const form = document.querySelector('.contact-form');

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

if (form) {
    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Impede a página de recarregar

        // Mapeia os dados dos inputs do formulário (Garanta que os 'id's batem com o HTML)
        const formData = {
            fullName: form.querySelector('input[type="text"]').value,
            email: form.querySelector('input[type="email"]').value,
            phoneNumber: form.querySelector('input[type="tel"]').value,
            service: form.querySelector('select').value,
            projectDetails: form.querySelector('textarea').value
        };

        try {
            // Dispara a requisição para o seu backend em Node.js
            const response = await fetch('http://localhost:5000/api/estimates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message); 
                form.reset(); // Limpa os campos do formulário após o sucesso
            } else {
                // Caso o backend devolva algum erro
                alert(data.error || 'Error sending form.');
            }

        } catch (error) {
            console.error('Error in form submission:', error);
            alert('Not able to send form. Please try again later.');
        }
    });
}