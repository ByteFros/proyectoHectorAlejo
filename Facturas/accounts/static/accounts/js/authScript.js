// Elementos del DOM
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const toggleButton = document.getElementById("toggleButton");
const header = document.getElementById("header");
const messageContainer = document.getElementById("messages");

let isLogin = true;

// Alternar entre Login y Register
toggleButton.addEventListener("click", () => {
    isLogin = !isLogin;
    header.textContent = isLogin ? "Login" : "Register";

    if (isLogin) {
        loginForm.style.display = "block";
        registerForm.style.display = "none";
        toggleButton.textContent = "¿No tienes una cuenta?";
    } else {
        loginForm.style.display = "none";
        registerForm.style.display = "block";
        toggleButton.textContent = "¿Ya tienes una cuenta?";
    }
});

// Función para obtener el token CSRF
function getCSRFToken() {
    const csrfInput = document.querySelector('input[name="csrfmiddlewaretoken"]');
    return csrfInput ? csrfInput.value : "";
}

// Ocultar mensajes de Django después de 5 segundos
document.addEventListener("DOMContentLoaded", function () {
    if (messageContainer) {
        setTimeout(() => {
            messageContainer.style.display = "none";
        }, 3000);
    }
});
