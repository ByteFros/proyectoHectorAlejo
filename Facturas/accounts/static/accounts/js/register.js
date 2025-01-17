document.addEventListener('DOMContentLoaded', () => {
    const errorMessages = document.getElementById('error-messages');
    const helpTexts = document.querySelectorAll('.helptext'); // Selecciona las etiquetas de ayuda

    // Ocultar etiquetas de ayuda
    helpTexts.forEach(helpText => {
        helpText.style.display = 'none';
    });

    // Mostrar mensajes de error si existen
    if (errorMessages && errorMessages.innerText.trim() !== '') {
        errorMessages.classList.remove('hidden');
    }
});
