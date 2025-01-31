const setupHomeButton = () => {
    const homeButton = document.getElementById('home');
    const homeContent = document.getElementById('homeContent');
    const invoicesContent = document.getElementById('invoicesContent');
    const profileContent = document.getElementById('profileContent');

    const loadHomeContent = async () => {
        homeContent.style.display = 'block';
        invoicesContent.style.display = 'none';
        profileContent.style.display = 'none';

        homeContent.innerHTML = `
            <h2>Resumen de Gasto y Cobro</h2>
            <canvas id="financeChart" width="400" height="200"></canvas>
            <button id="downloadCSV">Descargar Resumen (CSV)</button>
            <table class="totals-table">
            <thead>
                <tr>
                    <th>Total Cobradas</th>
                    <th>Total Pagadas</th>
                    <th>IVA Neto</th>
                    <th>IVA a Pagar</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td id="totalCobradas">0.00€</td>
                    <td id="totalPagadas">0.00€</td>
                    <td id="ivaNeto">0.00€</td>
                    <td id="ivaPagar">0.00€</td>
                </tr>
            </tbody>
        </table>

        `;

        const financeChart = document.getElementById('financeChart');

        try {
            const response = await fetch('/procesamiento/invoices/');
            const { invoices, totals } = await response.json();

            if (!Array.isArray(invoices) || !totals) {
                throw new Error("La respuesta del servidor no contiene datos válidos.");
            }

            const data = processInvoicesForChart(invoices);
            renderChart(financeChart, data);

            // Calcular IVA Neto y actualizar la tabla de totales
            const ivaNet = calculateIvaNet(totals);
            document.getElementById('totalCobradas').textContent = `${parseFloat(totals.cobradas || 0).toFixed(2)} €`;
            document.getElementById('totalPagadas').textContent = `${parseFloat(totals.pagadas || 0).toFixed(2)} €`;
            document.getElementById('ivaNeto').textContent = `${ivaNet.toFixed(2)} €`;
            document.getElementById('ivaPagar').textContent = `${ivaNet > 0 ? ivaNet.toFixed(2) : "0.00"} €`;

            setupDownloadCSVButton(invoices);
        } catch (error) {
            console.error('Error al cargar las facturas:', error);
        }
    };

    homeButton.addEventListener('click', loadHomeContent);
    loadHomeContent(); // Cargar al inicio
};

const calculateIvaNet = (totals) => {
    if (!totals || typeof totals.cobradas === 'undefined' || typeof totals.pagadas === 'undefined') {
        return 0;
    }

    const totalCobradas = parseFloat(totals.cobradas) || 0;
    const totalPagadas = parseFloat(totals.pagadas) || 0;

    const ivaCobro = totalCobradas * 0.21;
    const ivaGasto = totalPagadas * 0.21;

    return ivaCobro - ivaGasto;
};

const processInvoicesForChart = (invoices) => {
    const data = {
        months: Array(12).fill(0).map((_, i) => new Date(0, i).toLocaleString('es-ES', { month: 'long' })),
        expenses: Array(12).fill(0),
        incomes: Array(12).fill(0),
    };

    invoices.forEach((invoice) => {
        const month = new Date(invoice.uploadedAt).getMonth();
        const cost = parseFloat(invoice.cost);
        const iva = cost * 0.21;

        if (invoice.type === 'pagada') {
            data.expenses[month] += cost + iva;
        } else if (invoice.type === 'cobrada') {
            data.incomes[month] += cost + iva;
        }
    });

    return data;
};

const renderChart = (canvas, data) => {
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: data.months,
            datasets: [
                {
                    label: 'Gasto',
                    data: data.expenses,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                },
                {
                    label: 'Cobro',
                    data: data.incomes,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                },
            },
        },
    });
};

const setupDownloadCSVButton = (invoices) => {
    const button = document.getElementById('downloadCSV');
    button.addEventListener('click', () => {
        const csvContent = generateCSVContent(invoices);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'resumen_facturas.csv');
        link.click();
    });
};

const generateCSVContent = (invoices, ivaNet) => {
    const headers = ['Concepto', 'Costo', 'IVA', 'Tipo'];
    const rows = invoices.map((invoice) => {
        const cost = parseFloat(invoice.cost);
        const iva = cost * 0.21;
        return [
            invoice.concept,
            cost.toFixed(2),
            iva.toFixed(2),
            invoice.type,
        ].join(',');
    });

    // Agregar fila con el IVA Neto y a Pagar al final del CSV
    rows.push(['',])

    return [headers.join(','), ...rows].join('\n');
};
