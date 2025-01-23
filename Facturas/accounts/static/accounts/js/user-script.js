console.log('Script cargado correctamente.');
console.log('Script cargado correctamente.');
console.log('Script cargado correctamente.');
console.log('Script cargado correctamente.');
console.log('Script cargado correctamente.');
document.addEventListener('DOMContentLoaded', () => {
    // Variables comunes
    const welcomeMessage = document.getElementById('welcomeMessage');
    const mainContent = document.getElementById('main-content');
    const logoutButton = document.getElementById('logoutButton');
    const logoutForm = document.getElementById('logoutForm');
    const uploadInvoiceButton = document.getElementById('uploadInvoice');
    const viewInvoicesButton = document.getElementById('viewInvoices');
    const profileButton = document.getElementById('profileButton');
    const username = localStorage.getItem('username') || 'usuario';

    // Mostrar mensaje de bienvenida
    if (welcomeMessage) {
        welcomeMessage.textContent = `¡Bienvenid@, ${username}!`;
    }



    // Lógica de Logout
    console.log('Botón Logout:', logoutButton);
    console.log('Formulario Logout:', logoutForm);
    if (logoutButton && logoutForm) {
        logoutButton.addEventListener('click', () => {
            alert('Has cerrado sesión.');
            logoutForm.submit(); // Envía el formulario al backend
        });
    } else {
        console.error('El botón o el formulario de logout no fueron encontrados en el DOM.');
    }


// Botón Subir Factura
if (uploadInvoiceButton) {
    uploadInvoiceButton.addEventListener('click', () => {
        // Generar dinámicamente el formulario
        mainContent.innerHTML = `
            <h1>Subir Factura</h1>
            <form id="uploadForm" method="post" enctype="multipart/form-data">
                <input type="hidden" name="csrfmiddlewaretoken" value="${getCSRFToken()}">

                <label for="concepto">Concepto:</label>
                <input type="text" id="concepto" name="concepto" required>

                <label for="coste">Coste (€):</label>
                <input type="number" id="coste" name="coste" step="0.01" required>

                <label for="tipo_factura">Tipo de Factura:</label>
                <select id="tipo_factura" name="tipo_factura" required>
                    <option value="cobrada">Cobrada</option>
                    <option value="pagada">Pagada</option>
                </select>

                <label for="fileInput">Seleccionar archivo:</label>
                <input type="file" id="fileInput" name="file" required>

                <button type="submit">Subir</button>
            </form>
        `;

        // Obtener el formulario después de insertarlo en el DOM
        const uploadForm = document.getElementById('uploadForm');
        if (uploadForm) {
            uploadForm.addEventListener('submit', async (event) => {
                event.preventDefault();

                const fileInput = document.getElementById('fileInput');
                const concepto = document.getElementById('concepto').value;
                const coste = document.getElementById('coste').value;
                const tipoFactura = document.getElementById('tipo_factura').value; // Cambiado de 'formato' a 'tipo_factura'
                const file = fileInput.files[0];

                if (file && concepto && coste && tipoFactura) {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('concepto', concepto);
                    formData.append('coste', coste);
                    formData.append('tipo_factura', tipoFactura); // Cambiado de 'formato' a 'tipo_factura'
                    formData.append('csrfmiddlewaretoken', getCSRFToken());

                    try {
                        const response = await fetch('/procesamiento/upload/', {
                            method: 'POST',
                            body: formData,
                        });

                        if (response.ok) {
                            alert('Factura subida correctamente.');
                            mainContent.innerHTML = '<p>La factura fue subida exitosamente. ¡Gracias!</p>';
                        } else {
                            const errorData = await response.json(); // Intentar obtener detalles del error
                            alert(`Error al subir la factura: ${errorData.error || 'Intente nuevamente.'}`);
                        }
                    } catch (error) {
                        console.error('Error:', error);
                        alert('Ocurrió un error al intentar subir la factura.');
                    }
                } else {
                    alert('Por favor, completa todos los campos y selecciona un archivo para subir.');
                }
            });
        } else {
            console.error('No se pudo encontrar el formulario de subida.');
        }
    });
}


    // Botón Perfil
    if (profileButton) {
        profileButton.addEventListener('click', async () => {
            try {
                const response = await fetch('/accounts/profile/data/');
                const userData = await response.json();

                mainContent.innerHTML = `
                <h2>Información del Perfil</h2>
                <form id="profileForm" method="post">
                    <input type="hidden" name="csrfmiddlewaretoken" value="${getCSRFToken()}">

                    <label for="username">Nombre de usuario:</label>
                    <input type="text" id="username" value="${userData.username}" readonly>

                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" value="${userData.email}" required>

                    <label for="nif">NIF:</label>
                    <input type="text" id="nif" value="${userData.nif}" readonly>

                    <label for="address">Dirección:</label>
                    <input type="text" id="address" name="address" value="${userData.address}">

                    <label for="city">Población:</label>
                    <input type="text" id="city" name="city" value="${userData.city}">

                    <label for="postalCode">Código Postal:</label>
                    <input type="text" id="postalCode" name="postalCode" value="${userData.postalCode}">

                    <button type="submit">Actualizar</button>
                </form>
            `;

                const profileForm = document.getElementById('profileForm');
                profileForm.addEventListener('submit', async (event) => {
                    event.preventDefault();

                    const formData = new FormData(profileForm);

                    try {
                        const response = await fetch('/accounts/profile/', {
                            method: 'POST',
                            body: formData,
                        });

                        if (response.ok) {
                            alert('Perfil actualizado correctamente.');
                        } else {
                            alert('Error al actualizar el perfil.');
                        }
                    } catch (error) {
                        alert('Error al procesar la solicitud.');
                        console.error(error);
                    }
                });
            } catch (error) {
                console.error('Error al cargar los datos del perfil:', error);
                alert('Ocurrió un error al cargar los datos del perfil.');
            }
        });
    }

    // Botón Facturas con filtrado
if (viewInvoicesButton) {
    viewInvoicesButton.addEventListener('click', async () => {
        mainContent.innerHTML = `
            <h2>Mis Facturas</h2>
            <table class="invoice-table">
                <thead>
                    <tr>
                        <th>Concepto</th>
                        <th>Costo</th>
                        <th>Formato</th>
                        <th>Archivo</th>
                    </tr>
                </thead>
                <tbody id="invoiceTableBody">
                    <!-- Las filas de las facturas se generarán dinámicamente aquí -->
                </tbody>
            </table>
        `;

        const invoiceTableBody = document.getElementById('invoiceTableBody');

        try {
            // Llamada al endpoint que devuelve el JSON
            const response = await fetch('/procesamiento/invoices/');
            if (!response.ok) {
                throw new Error('Error al cargar las facturas.');
            }

            const invoices = await response.json();

            // Verificar si hay datos en el JSON
            if (invoices.length === 0) {
                invoiceTableBody.innerHTML = '<tr><td colspan="4">No se encontraron facturas.</td></tr>';
                return;
            }

            // Generar las filas dinámicamente
            invoices.forEach(invoice => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${invoice.concept}</td>
                    <td>${parseFloat(invoice.cost).toFixed(2)}</td>
                    <td>${invoice.format === 'cobrada' ? 'Cobrada' : 'Pagada'}</td>
                    <td><a href="${invoice.fileUrl}" target="_blank">Ver archivo</a></td>
                `;
                invoiceTableBody.appendChild(row);
            });
        } catch (error) {
            alert('Error al cargar las facturas.');
            console.error('Error:', error);
        }
    });
}


    // Función para obtener el CSRF token
    function getCSRFToken() {
        const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];
        return cookieValue || '';
    }
});
