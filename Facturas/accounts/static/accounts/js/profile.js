const setupProfileButton = () => {
    const profileContent = document.getElementById('profileContent');
    const homeContent = document.getElementById('homeContent');
    const invoicesContent = document.getElementById('invoicesContent');

    const loadProfileContent = async () => {
        try {
            homeContent.style.display = 'none';
            invoicesContent.style.display = 'none';
            profileContent.style.display = 'block';

            const response = await fetch('/accounts/profile/data/');
            if (!response.ok) throw new Error('Error al cargar los datos del perfil.');

            const userData = await response.json();

            // Crear HTML del perfil con imagen
            profileContent.innerHTML = `
                <div class="profile-container">
                    <form id="profileForm" class="profile-form" enctype="multipart/form-data">
                        <label for="username">Usuario:</label>
                        <input type="text" id="username" value="${userData.username}" readonly>

                        <label for="email">Correo electrónico:</label>
                        <input type="email" id="email" value="${userData.email}" required>

                        <label for="nif">NIF:</label>
                        <input type="text" id="nif" value="${userData.nif}" readonly>

                        <label for="address">Dirección:</label>
                        <input type="text" id="address" value="${userData.address}" required>

                        <label for="city">Ciudad:</label>
                        <input type="text" id="city" value="${userData.city}" required>

                        <label for="postalCode">Código Postal:</label>
                        <input type="text" id="postalCode" value="${userData.postalCode}" required>

                        <label for="companyLogo">Logo de la Empresa:</label>
                        <input type="file" id="companyLogo" name="company_logo" accept="image/*">
                        <div class="image-preview">
                            ${userData.company_logo
                                ? `<img id="currentLogo" src="${userData.company_logo}" alt="Logo de la Empresa">`
                                : `<p>No se ha subido una imagen aún.</p>`}
                        </div>

                        <button type="submit">Actualizar</button>
                    </form>
                </div>
            `;

            const profileForm = document.getElementById('profileForm');
            profileForm.addEventListener('submit', async (event) => {
                event.preventDefault();

                const formData = new FormData();
                formData.append('email', document.getElementById('email').value);
                formData.append('address', document.getElementById('address').value);
                formData.append('city', document.getElementById('city').value);
                formData.append('postalCode', document.getElementById('postalCode').value);

                // 📌 Capturar la imagen si se ha seleccionado una nueva
                const companyLogoInput = document.getElementById('companyLogo');
                if (companyLogoInput.files.length > 0) {
                    formData.append('company_logo', companyLogoInput.files[0]);
                }

                try {
                    const response = await fetch('/accounts/profile/', {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'X-CSRFToken': getCSRFToken(),  // 📌 Se envía el token CSRF
                        },
                        credentials: 'same-origin'
                    });

                    const result = await response.json();
                    if (!response.ok) throw new Error(result.error || 'Error al actualizar el perfil.');

                    alert('Perfil actualizado correctamente.');

                    // 📌 Si hay una nueva imagen, actualizar la vista previa
                    if (result.company_logo) {
                        const currentLogo = document.getElementById('currentLogo');
                        if (currentLogo) {
                            currentLogo.src = result.company_logo;
                        } else {
                            document.querySelector('.image-preview').innerHTML = `<img id="currentLogo" src="${result.company_logo}" alt="Logo de la Empresa" style="max-width: 150px; max-height: 150px;">`;
                        }
                    }

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
