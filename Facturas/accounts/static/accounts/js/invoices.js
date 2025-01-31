const setupInvoicesButton = () => {
    const invoicesContent = document.getElementById('invoicesContent');
    const homeContent = document.getElementById('homeContent');
    const profileContent = document.getElementById('profileContent');
    const invoiceTableBody = document.getElementById('invoiceTableBody');
    const totalsTableBody = document.getElementById('totalsTableBody');

    // Función para cargar las facturas del usuario
    const loadInvoices = async (filterType = 'all') => {
        homeContent.style.display = 'none';
        invoicesContent.style.display = 'block';
        profileContent.style.display = 'none';

        try {
            const response = await fetch(`/procesamiento/invoices/?type=${filterType}`);
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            const { invoices, totals } = data;

            invoiceTableBody.innerHTML = '';
            totalsTableBody.innerHTML = '';

            if (invoices.length === 0) {
                invoiceTableBody.innerHTML = '<tr><td colspan="7">No se encontraron facturas.</td></tr>';
                return;
            }

            invoices.forEach((invoice) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${invoice.concept}</td>
                    <td>${invoice.cost.toFixed(2)}</td>
                    <td>${invoice.currency || 'Sin definir'}</td>
                    <td>${invoice.type || 'Sin definir'}</td>
                    <td><button class="action-btn show" data-id="${invoice.id}">Mostrar</button></td>
                    <td><a href="${invoice.fileUrl}" target="_blank" class="action-btn download">Descargar</a></td>
                    <td><button class="action-btn delete" data-id="${invoice.id}">Eliminar</button></td>
                `;
                invoiceTableBody.appendChild(row);
            });

            // Actualizar los totales según el filtro seleccionado
            let totalCobradas = Number(totals.cobradas) || 0;
            let totalPagadas = Number(totals.pagadas) || 0;

            if (filterType === 'cobrada') {
                totalsTableBody.innerHTML = `
                    <tr>
                        <td>Total Cobradas</td>
                        <td>${totalCobradas.toFixed(2)} €</td>
                    </tr>
                `;
            } else if (filterType === 'pagada') {
                totalsTableBody.innerHTML = `
                    <tr>
                        <td>Total Pagadas</td>
                        <td>${totalPagadas.toFixed(2)} €</td>
                    </tr>
                `;
            } else {
                totalsTableBody.innerHTML = `
                    <tr>
                        <td>Total Cobradas</td>
                        <td>${totalCobradas.toFixed(2)} €</td>
                    </tr>
                    <tr>
                        <td>Total Pagadas</td>
                        <td>${totalPagadas.toFixed(2)} €</td>
                    </tr>
                `;
            }

            setupInvoiceButtons();
        } catch (error) {
            console.error('Error al cargar las facturas:', error);
            alert('Error al cargar las facturas. Intenta nuevamente.');
        }
    };

    // Configurar el filtro de facturas
    const setupFilter = () => {
        if (document.getElementById('invoiceFilter')) return; // Evitar duplicar el filtro

        const filterContainer = document.createElement('div');
        filterContainer.className = 'filter-container';
        filterContainer.innerHTML = `
            <label for="invoiceFilter">Filtrar:</label>
            <select id="invoiceFilter">
                <option value="all">Todas</option>
                <option value="cobrada">Cobradas</option>
                <option value="pagada">Pagadas</option>
            </select>
        `;

        if (!invoicesContent) {
            console.error('Elemento invoicesContent no encontrado');
            return;
        }
        invoicesContent.prepend(filterContainer);

        const filterSelect = document.getElementById('invoiceFilter');
        filterSelect.addEventListener('change', (e) => {
            const filterValue = e.target.value;
            loadInvoices(filterValue); // Recargar las facturas con el filtro aplicado
        });
    };

    // Configurar los botones (descargar, mostrar, eliminar)
    const setupInvoiceButtons = () => {
        // Descargar factura
        document.querySelectorAll('.action-btn.download').forEach((button) => {
            button.addEventListener('click', (event) => {
                const id = event.target.dataset.id;
                window.location.href = `/procesamiento/invoices/${id}/download/`;
            });
        });

        // Mostrar detalles de factura
        document.querySelectorAll('.action-btn.show').forEach((button) => {
            button.addEventListener('click', async (event) => {
                const id = event.target.dataset.id;
                try {
                    const response = await fetch(`/procesamiento/invoices/${id}/`);
                    if (!response.ok) throw new Error('No se pudo cargar la factura.');
                    const invoice = await response.json();
                    alert(`Factura: ${invoice.concept}, Costo: ${invoice.cost}, Moneda: ${invoice.currency}`);
                } catch (error) {
                    console.error('Error al mostrar factura:', error);
                    alert('Error al mostrar los detalles de la factura.');
                }
            });
        });

        // Eliminar factura
        document.querySelectorAll('.action-btn.delete').forEach((button) => {
            button.addEventListener('click', async (event) => {
                const id = event.target.dataset.id;

                if (confirm('¿Estás seguro de que deseas eliminar esta factura?')) {
                    try {
                        const response = await fetch(`/procesamiento/invoices/${id}/delete/`, {
                            method: 'DELETE',
                            headers: {
                                'X-CSRFToken': getCSRFToken(),
                                'Content-Type': 'application/json',
                            },
                        });

                        if (!response.ok) {
                            throw new Error(`Error al eliminar la factura: ${response.status}`);
                        }

                        alert('Factura eliminada correctamente.');
                        loadInvoices(); // Recargar la lista de facturas
                    } catch (error) {
                        console.error('Error al eliminar factura:', error);
                        alert('Error al eliminar la factura.');
                    }
                }
            });
        });

        // Mostrar previsualización de factura
        document.querySelectorAll('.action-btn.preview').forEach((button) => {
            button.addEventListener('click', async (event) => {
                const id = event.target.dataset.id;
                const previewUrl = `/procesamiento/invoices/${id}/preview/`;
                window.open(previewUrl, '_blank');
            });
        });
    };

    // Función para obtener el token CSRF
    const getCSRFToken = () => {
        const cookieValue = document.cookie
            .split('; ')
            .find((row) => row.startsWith('csrftoken='))
            ?.split('=')[1];
        return cookieValue || '';
    };

    // Inicializar el botón de "Mis Facturas"
    document.getElementById('viewInvoices').addEventListener('click', () => {
        setupFilter(); // Configurar el filtro una vez
        loadInvoices(); // Cargar todas las facturas inicialmente
    });
};