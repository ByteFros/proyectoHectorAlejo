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
            <canvas id="financeChart" width="400" height="200"></canvas>
            <button id="downloadCSV">Descargar Resumen (CSV)</button>
            <div class="table-container">
                <table class="totals-table">
                    <thead>
                        <tr>
                            <th>Total Cobrado</th>
                            <th>Total Pagado</th>
                            <th>IVA Cobrado</th>
                            <th>IVA Pagado</th>
                            <th>IVA Total</th>
                            <th>IVA a Devolver</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td id="totalCobradas">0.00€</td>
                            <td id="totalPagadas">0.00€</td>
                            <td id="ivaCobrado">0.00€</td>
                            <td id="ivaPagado">0.00€</td>
                            <td id="ivaTotal">0.00€</td>
                            <td id="ivaDevolver">0.00€</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;

        const financeChart = document.getElementById('financeChart');

        try {
            const response = await fetch('/procesamiento/invoices/');
            const { invoices, totals } = await response.json();

            if (!Array.isArray(invoices) || !totals) {
                throw new Error("La respuesta del servidor no contiene datos válidos.");
            }

            // Generar datos para el gráfico 📊
            const data = processInvoicesForChart(invoices);
            renderChart(financeChart, data);

            // Calcular y actualizar la tabla
            const ivaResults = calculateIvaNet(totals);

            document.getElementById('totalCobradas').textContent = `${parseFloat(totals.cobradas || 0).toFixed(2)} €`;
            document.getElementById('totalPagadas').textContent = `${parseFloat(totals.pagadas || 0).toFixed(2)} €`;
            document.getElementById('ivaCobrado').textContent = `${ivaResults.ivaCobrado} €`;
            document.getElementById('ivaPagado').textContent = `${ivaResults.ivaPagado} €`;
            document.getElementById('ivaTotal').textContent = `${ivaResults.ivaTotal} €`;
            document.getElementById('ivaDevolver').textContent = `${ivaResults.ivaDevolver} €`;

            setupDownloadCSVButton(invoices);
        } catch (error) {
            console.error('Error al cargar las facturas:', error);
        }
    };

    homeButton.addEventListener('click', loadHomeContent);
    loadHomeContent(); // Cargar al inicio
};

const setupDownloadCSVButton = (invoices) => {
    const downloadButton = document.getElementById('downloadCSV');
    if (!downloadButton) return;

    downloadButton.addEventListener('click', () => {
        if (!invoices || invoices.length === 0) {
            alert('No hay facturas disponibles para exportar.');
            return;
        }

        let csvContent = 'Tipo,Fecha,Costo,IVA Total\n';
        invoices.forEach(invoice => {
            const date = new Date(invoice.uploadedAt).toLocaleDateString('es-ES');
            const cost = parseFloat(invoice.cost).toFixed(2);
            const iva = (cost * 0.21).toFixed(2);
            csvContent += `${invoice.type},${date},${cost} €,${iva} €\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'resumen_facturas.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
};


// 📌 Función para calcular IVA Cobrado, IVA Pagado, IVA Total y IVA a Devolver
const calculateIvaNet = (totals) => {
    if (!totals || typeof totals.cobradas === 'undefined' || typeof totals.pagadas === 'undefined') {
        return {
            ivaCobrado: "0.00",
            ivaPagado: "0.00",
            ivaTotal: "0.00",
            ivaDevolver: "0.00"
        };
    }

    const ivaRate = 0.21; // Tasa de IVA

    const totalCobradas = parseFloat(totals.cobradas) || 0;
    const totalPagadas = parseFloat(totals.pagadas) || 0;

    // Calcular el IVA Cobrado y Pagado
    const ivaCobrado = totalCobradas * ivaRate;
    const ivaPagado = totalPagadas * ivaRate;

    // IVA Total: Diferencia entre el IVA cobrado y pagado
    const ivaTotal = ivaCobrado - ivaPagado;

    // IVA a devolver si el resultado es negativo
    const ivaDevolver = ivaTotal < 0 ? Math.abs(ivaTotal) : 0;

    return {
        ivaCobrado: ivaCobrado.toFixed(2),
        ivaPagado: ivaPagado.toFixed(2),
        ivaTotal: ivaTotal.toFixed(2),
        ivaDevolver: ivaDevolver.toFixed(2)
    };
};

// 📊 Función para procesar los datos de las facturas para el gráfico
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

// 📊 Función para generar el gráfico con Chart.js
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
