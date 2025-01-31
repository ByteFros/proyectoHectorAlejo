const setupProfileButton = () => {
    const profileContent = document.getElementById('profileContent');
    const homeContent = document.getElementById('homeContent');
    const invoicesContent = document.getElementById('invoicesContent');

    const loadProfileContent = async () => {
        try {
            // Oculta otros contenidos y muestra el contenedor del perfil
            homeContent.style.display = 'none';
            invoicesContent.style.display = 'none';
            profileContent.style.display = 'block';

            // Realiza una solicitud para obtener los datos del perfil
            const response = await fetch('/accounts/profile/data/');
            if (!response.ok) throw new Error('Error al cargar los datos del perfil.');

            const userData = await response.json();

            // Actualiza el contenido del contenedor con los datos del perfil
            profileContent.innerHTML = `
                <div class="profile-container">
                    <form id="profileForm" class="profile-form">
                        <label for="username">Usuario:</label>
                        <input type="text" id="username" value="${userData.username}" readonly style="pointer-events: none;">
            
                        <label for="email">Correo electrónico:</label>
                        <input type="email" id="email" value="${userData.email}" required>
            
                        <label for="nif">NIF:</label>
                        <input type="text" id="nif" value="${userData.nif}" readonly style="pointer-events: none;">
            
                        <label for="address">Dirección:</label>
                        <input type="text" id="address" value="${userData.address}" required style="pointer-events: none;">
            
                        <label for="city">Ciudad:</label>
                        <input type="text" id="city" value="${userData.city}" required style="pointer-events: none;">
            
                        <label for="postalCode">Código Postal:</label>
                        <input type="text" id="postalCode" value="${userData.postalCode}" required style="pointer-events: none;">
            
                        <button type="submit">Actualizar</button>
                    </form>
                </div>
            `;

            // Evento para enviar el formulario
            const profileForm = document.getElementById('profileForm');
            profileForm.addEventListener('submit', async (event) => {
                event.preventDefault();

                const formData = {
                    email: document.getElementById('email').value,
                    address: document.getElementById('address').value,
                    city: document.getElementById('city').value,
                    postalCode: document.getElementById('postalCode').value
                };

                try {
                    const response = await fetch('/accounts/profile/', {
                        method: 'POST',
                        body: JSON.stringify(formData),
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': getCSRFToken(),  // Se envía el token CSRF
                        },
                        credentials: 'same-origin'
                    });

                    const result = await response.json();
                    if (!response.ok) throw new Error(result.error || 'Error al actualizar el perfil.');

                    alert('Perfil actualizado correctamente.');
                } catch (error) {
                    alert('Error al actualizar el perfil.');
                    console.error(error);
                }
            });

        } catch (error) {
            alert('Error al cargar el perfil.');
            console.error(error);
        }
    };

    // Vincula el evento al botón del perfil
    const profileButton = document.getElementById('profileButton');
    if (profileButton) {
        profileButton.addEventListener('click', loadProfileContent);
    } else {
        console.error('El botón del perfil no se encontró en el DOM.');
    }
};

// Función global para obtener el token CSRF
const getCSRFToken = () => {
    const cookieValue = document.cookie
        .split('; ')
        .find((row) => row.startsWith('csrftoken='))
        ?.split('=')[1];
    return cookieValue || '';
};
