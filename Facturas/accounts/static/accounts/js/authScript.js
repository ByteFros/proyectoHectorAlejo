// Alternar entre Login y Register


console.log("hola")
console.log("hola")
console.log("hola")
console.log("hola")

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const toggleButton = document.getElementById('toggleButton');
const header = document.getElementById('header');

let isLogin = true;
toggleButton.addEventListener('click', () => {
    isLogin = !isLogin;
    header.textContent = isLogin ? 'Login' : 'Register';
    if (isLogin) {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        toggleButton.textContent = '¿No tienes una cuenta?';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        toggleButton.textContent = '¿Ya tienes una cuenta?';
    }
});

function getCSRFToken() {
    const csrfInput = document.querySelector('input[name="csrfmiddlewaretoken"]');
    return csrfInput ? csrfInput.value : '';
}