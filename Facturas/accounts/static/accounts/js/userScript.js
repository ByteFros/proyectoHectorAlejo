document.addEventListener('DOMContentLoaded', () => {
    const welcomeMessage = document.getElementById('welcomeMessage');
    const mainContent = document.getElementById('main-content');
    const logoutButton = document.getElementById('logoutButton');

    // Suponiendo que el nombre de usuario se pasa desde el backend
    const username = localStorage.getItem('username') || 'usuario';
    welcomeMessage.textContent = `¡Bienvenid@, ${username}!`;

    // Lógica de Logout
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('username');
        alert('Has cerrado sesión.');
        window.location.href = '../login-registro/index.html';
    });

document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('main-content');
    const uploadInvoiceButton = document.getElementById('uploadInvoice');

    if (uploadInvoiceButton) {
        uploadInvoiceButton.addEventListener('click', () => {
            // Renderiza dinámicamente el formulario en el contenedor
            mainContent.innerHTML = `
                <h1>Subir Factura</h1>
                <form id="uploadForm" method="post" enctype="multipart/form-data">
                    <input type="hidden" name="csrfmiddlewaretoken" value="${getCSRFToken()}">
                    <label for="fileInput">Seleccionar archivo:</label>
                    <input type="file" id="fileInput" name="file" required>
                    <button type="submit">Subir</button>
                </form>
                <a href="#">Volver al panel</a>
            `;

            // Agrega un manejador de eventos al formulario
            const uploadForm = document.getElementById('uploadForm');
            uploadForm.addEventListener('submit', async (event) => {
                event.preventDefault(); // Previene el envío tradicional del formulario
                const fileInput = document.getElementById('fileInput');
                const file = fileInput.files[0];

                if (file) {
                    const formData = new FormData();
                    formData.append('file', file);
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
                            alert('Error al subir la factura.');
                        }
                    } catch (error) {
                        console.error(error);
                        alert('Ocurrió un error al intentar subir la factura.');
                    }
                } else {
                    alert('Por favor, selecciona un archivo para subir.');
                }
            });
        });
    }

    // Función para obtener el CSRF token desde las cookies
    function getCSRFToken() {
        const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];
        return cookieValue || '';
    }
});
    // Botón Facturas con filtrado
    const viewInvoicesButton = document.getElementById('viewInvoices');
    if (viewInvoicesButton) {
        viewInvoicesButton.addEventListener('click', async () => {
            mainContent.innerHTML = `
                <div class="filter-container">
                    <label for="invoiceFilter">Filtrar por tipo:</label>
                    <select id="invoiceFilter">
                        <option value="all">Todas</option>
                        <option value="paid">Cobradas</option>
                        <option value="unpaid">Pagadas</option>
                    </select>
                </div>
                <ul id="invoiceList"></ul>
            `;

            const invoiceList = document.getElementById('invoiceList');
            const invoiceFilter = document.getElementById('invoiceFilter');

            // Función para cargar facturas según el filtro
            const loadInvoices = async (filter) => {
                invoiceList.innerHTML = ''; // Limpia la lista
                try {
                    let url = '/get-invoices'; // Por defecto, muestra todas
                    if (filter === 'paid') url = '/get-paid-invoices';
                    if (filter === 'unpaid') url = '/get-unpaid-invoices';

                    const response = await fetch(url);
                    const invoices = await response.json();
                    if (invoices.length === 0) {
                        invoiceList.innerHTML = '<li>No se encontraron facturas.</li>';
                        return;
                    }

                    invoices.forEach(invoice => {
                        const listItem = document.createElement('li');
                        listItem.textContent = `Factura: ${invoice.name}, Fecha: ${invoice.date}`;
                        invoiceList.appendChild(listItem);
                    });
                } catch (error) {
                    alert('Error al obtener las facturas.');
                }
            };

            // Cargar todas las facturas al inicio
            loadInvoices('all');

            // Manejar cambios en el filtro
            invoiceFilter.addEventListener('change', (event) => {
                const selectedFilter = event.target.value;
                console.log(`Filtro seleccionado: ${selectedFilter}`);
                loadInvoices(selectedFilter);
            });
        });
    }

    // Botón Análisis
    const analysisButton = document.getElementById('analysis');
    if (analysisButton) {
        analysisButton.addEventListener('click', async () => {
            mainContent.innerHTML = '<div id="analysisContent"></div>';
            const analysisContent = document.getElementById('analysisContent');
            try {
                const response = await fetch('/get-analysis');
                const analysis = await response.json();
                analysisContent.innerHTML = `
                    <p>Total del Mes 1: ${analysis.month1}</p>
                    <p>Total del Mes 2: ${analysis.month2}</p>
                    <p>Total del Mes 3: ${analysis.month3}</p>
                    <p>Total Trimestre: ${analysis.total}</p>
                `;
            } catch (error) {
                alert('Error al obtener el análisis.');
            }
        });
    }

    // Botón Descargar Factura
    const downloadInvoiceButton = document.getElementById('downloadInvoice');
    if (downloadInvoiceButton) {
        downloadInvoiceButton.addEventListener('click', async () => {
            mainContent.innerHTML = '<ul id="downloadList"></ul>';
            const downloadList = document.getElementById('downloadList');
            try {
                const response = await fetch('/get-invoices');
                const invoices = await response.json();
                invoices.forEach(invoice => {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `<span>${invoice.name}</span> <button onclick="downloadInvoice('${invoice.id}')">Bajar</button>`;
                    downloadList.appendChild(listItem);
                });
            } catch (error) {
                alert('Error al obtener las facturas.');
            }
        });
    }

    // Función para descargar facturas
    window.downloadInvoice = function (id) {
        window.location.href = `/download-invoice/${id}`;
    };
});
