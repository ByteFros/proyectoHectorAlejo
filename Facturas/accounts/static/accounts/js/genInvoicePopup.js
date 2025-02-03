const setupGenInvoicePopup = () => {
    const genInvoiceButton = document.getElementById('genInvoice');

    const showInvoicePopup = async () => {
        // Obtener los datos del usuario
        let companyData = {};
        try {
            const response = await fetch('/accounts/profile/data/');

            if (!response.ok) {
                throw new Error('Error al obtener los datos de la empresa');
            }
            companyData = await response.json();
        } catch (error) {
            console.error('Error:', error);
        }

        let logoBase64 = null;
        if (companyData.company_logo) {
            try {
                const imageResponse = await fetch(companyData.company_logo);
                const imageBlob = await imageResponse.blob();
                const reader = new FileReader();
                reader.readAsDataURL(imageBlob);
                await new Promise(resolve => (reader.onloadend = resolve));
                logoBase64 = reader.result; // 📌 Guardar imagen en Base64
            } catch (error) {
                console.error("Error al cargar la imagen del logo:", error);
            }
        }

        // Crear el HTML del popup
        const popupHtml = `
            <div id="popup" class="popup-overlay">
                <div class="popup-content">
                    <form id="invoiceForm">
                        <label for="clientName">Nombre del Cliente:</label>
                        <input type="text" id="clientName" name="clientName" required>

                        <label for="clientEmail">Email del Cliente:</label>
                        <input type="email" id="clientEmail" name="clientEmail" required>

                        <label for="clientAddress">Dirección del Cliente:</label>
                        <input type="text" id="clientAddress" name="clientAddress" required>

                        <label for="clientNIF">NIF del Cliente:</label>
                        <input type="text" id="clientNIF" name="clientNIF" required>

                        <label for="clientPhone">Número de Teléfono:</label>
                        <input type="text" id="clientPhone" name="clientPhone" required>

                        <label for="concept">Concepto:</label>
                        <input type="text" id="concept" name="concept" required>

                        <label for="amount">Monto (€):</label>
                        <input type="number" id="amount" name="amount" step="0.01" required>

                        <label for="paymentMethod">Forma de Pago:</label>
                        <select id="paymentMethod" name="paymentMethod" required>
                            <option value="" disabled selected>Seleccione</option>
                            <option value="Efectivo">Efectivo</option>
                            <option value="Tarjeta de crédito">Tarjeta de crédito</option>
                            <option value="Transferencia bancaria">Transferencia bancaria</option>
                        </select>

                        <div class="popup-buttons">
                            <button type="submit" id="generatePDF">Generar PDF</button>
                            <button type="button" id="cancelPopup">Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Insertar el pop-up en el DOM
        document.body.insertAdjacentHTML('beforeend', popupHtml);

        // Configurar el botón para cerrar el popup
        document.getElementById('cancelPopup').addEventListener('click', () => {
            document.getElementById('popup').remove();
        });

        document.getElementById('invoiceForm').addEventListener('submit', (event) => {
            event.preventDefault(); // Prevenir recarga de la página

            // Obtener los datos del formulario
            const clientName = document.getElementById('clientName').value;
            const clientEmail = document.getElementById('clientEmail').value;
            const clientAddress = document.getElementById('clientAddress').value;
            const clientNIF = document.getElementById('clientNIF').value;
            const clientPhone = document.getElementById('clientPhone').value;
            const concept = document.getElementById('concept').value;
            const amount = parseFloat(document.getElementById('amount').value);

            // Ajustar el cálculo para que el monto ingresado ya incluya el IVA
            const total = amount; // El monto ingresado ya es el total con IVA
            const iva = total - (total / 1.21); // Desglose del IVA
            const baseAmount = total / 1.21; // Monto sin IVA

            const paymentMethod = document.getElementById('paymentMethod').value;

            // Obtener el número de factura actual del almacenamiento local
            let currentInvoiceNumber = localStorage.getItem('currentInvoiceNumber');
            if (!currentInvoiceNumber) {
                currentInvoiceNumber = 1; // Comienza en 1 si no hay un número guardado
            } else {
                currentInvoiceNumber = parseInt(currentInvoiceNumber, 10) + 1;
            }
            localStorage.setItem('currentInvoiceNumber', currentInvoiceNumber);
            const invoiceNumber = `ES-${String(currentInvoiceNumber).padStart(3, '0')}`;

            // Usar jsPDF
            if (!window.jspdf) {
                alert('Error: jsPDF no está disponible.');
                return;
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            if (logoBase64) {
                doc.addImage(logoBase64, 'PNG', 160, 10, 20, 20);  // 📌 Ajustar tamaño del logo
            }

            // Encabezado con logo y título
            doc.setFontSize(20);
            doc.setTextColor(40);
            doc.text(companyData.username || "Nombre no disponible", 20, 50);
            doc.setFontSize(12);
            doc.text(companyData.address || "Dirección no disponible", 20, 55);
            doc.text(companyData.city || "Ciudad no disponible", 20, 60);
            doc.text(companyData.postalCode || "Código Postal no disponible", 20, 65);
            doc.text(companyData.nif || "NIF no disponible", 20, 70);
            doc.text(companyData.email ? `${companyData.email}` : "Email no disponible", 20, 75);

            doc.setFontSize(18);
            doc.text('Factura', 105, 50,{ align: 'left' });
            doc.setFontSize(12);
            doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, 105, 55, { align: 'left' });
            doc.text(`Número de factura: ${invoiceNumber}`, 105, 60, { align: 'left' });

            // Tabla de información del cliente
            doc.autoTable({
                startY: 90,
                head: [['Información del Cliente']],
                body: [
                    [`Nombre: ${clientName}`],
                    [`Email: ${clientEmail}`],
                    [`Dirección: ${clientAddress}`],
                    [`NIF: ${clientNIF}`],
                    [`Teléfono: ${clientPhone}`],
                ],
                styles: {
                    halign: 'left',
                    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
                    bodyStyles: { textColor: 50 },
                },
            });

            // Tabla de detalles de la factura
            const tableStartY = doc.lastAutoTable.finalY + 10; // Colocar tabla debajo de la anterior
            doc.autoTable({
                startY: tableStartY,
                head: [['Concepto', 'Subtotal (€)', 'IVA (€)', 'Total (€)']],
                body: [
                    [concept, baseAmount.toFixed(2), iva.toFixed(2), total.toFixed(2)],
                ],
                styles: {
                    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
                    halign: 'center',
                },
                columnStyles: {
                    0: { halign: 'left' }, // Alinear concepto a la izquierda
                },
            });

            // Pie de página
            const pageHeight = doc.internal.pageSize.height;
            doc.setFontSize(10);
            doc.text(
                `Forma de pago: ${paymentMethod}`,
                20,
                pageHeight - 25
            );

            doc.save(`Factura_${clientName}.pdf`);

            // Cerrar el pop-up
            document.getElementById('popup').remove();
        });
    };

    if (genInvoiceButton) {
        genInvoiceButton.addEventListener('click', showInvoicePopup);
    }
};