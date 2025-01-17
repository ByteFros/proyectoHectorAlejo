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

    // Botón Subir Factura
    const uploadInvoiceButton = document.getElementById('uploadInvoice');
    if (uploadInvoiceButton) {
        uploadInvoiceButton.addEventListener('click', () => {
            mainContent.innerHTML = `
                <form id="uploadForm">
                    <label for="fileInput">Seleccionar archivo:</label>
                    <input type="file" id="fileInput" required>
                    <label for="invoiceType">Tipo de factura:</label>
                    <select id="invoiceType" required>
                        <option value="" disabled selected>Seleccione un tipo</option>
                        <option value="pagada">Pagada</option>
                        <option value="cobrada">Cobrada</option>
                    </select>
                    <button type="submit">Subir</button>
                </form>
            `;

            const uploadForm = document.getElementById('uploadForm');
            uploadForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const file = document.getElementById('fileInput').files[0];
                const invoiceType = document.getElementById('invoiceType').value;

                if (file && invoiceType) {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('type', invoiceType);

                    try {
                        const response = await fetch('/upload-invoice', {
                            method: 'POST',
                            body: formData,
                        });
                        const result = await response.json();
                        alert(result.message || 'Archivo subido correctamente.');
                    } catch (error) {
                        alert('Error al subir el archivo.');
                    }
                } else {
                    alert('Por favor, complete todos los campos.');
                }
            });
        });
    }

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
