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
            <p id="ivaSummary"></p>
        `;

        const financeChart = document.getElementById('financeChart');
        const ivaSummary = document.getElementById('ivaSummary');

        try {
            const response = await fetch('/procesamiento/invoices/');
            const invoices = await response.json();

            const data = processInvoicesForChart(invoices);
            renderChart(financeChart, data);

            const ivaNet = calculateIvaNet(data);
            ivaSummary.textContent = `Resumen IVA: ${ivaNet > 0 ? `A pagar: ${ivaNet}` : `A devolver: ${Math.abs(ivaNet)}`}`;

            setupDownloadCSVButton(invoices);
        } catch (error) {
            console.error('Error al cargar las facturas:', error);
        }
    };

    homeButton.addEventListener('click', loadHomeContent);
    loadHomeContent(); // Cargar al inicio
};

const processInvoicesForChart = (invoices) => {
    const data = {
        months: Array(12).fill(0).map((_, i) => new Date(0, i).toLocaleString('es-ES', { month: 'long' })),
        expenses: Array(12).fill(0),
        incomes: Array(12).fill(0),
    };

    invoices.forEach((invoice) => {
        const month = new Date(invoice.paymentDate).getMonth(); // Suponiendo que `paymentDate` está disponible
        const cost = parseFloat(invoice.cost);
        const iva = cost * 0.21; // IVA del 21%

        if (invoice.type === 'recibida') {
            data.expenses[month] += cost + iva;
        } else if (invoice.type === 'emitida') {
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

const calculateIvaNet = (data) => {
    const totalIncomes = data.incomes.reduce((acc, val) => acc + val, 0);
    const totalExpenses = data.expenses.reduce((acc, val) => acc + val, 0);

    const ivaCobro = totalIncomes * 0.21;
    const ivaGasto = totalExpenses * 0.21;

    return ivaCobro - ivaGasto;
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

const generateCSVContent = (invoices) => {
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

    return [headers.join(','), ...rows].join('\n');
};