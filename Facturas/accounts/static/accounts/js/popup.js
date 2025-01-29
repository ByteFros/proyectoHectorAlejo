const setupInvoicePopup = () => {
    const uploadInvoiceButton = document.getElementById('uploadInvoice');

    const showPopup = () => {
const popupHtml = `
    <div id="popup" class="popup-overlay">
        <div class="popup-content">
            <h2>Agregar Factura</h2>
            <form id="popupForm" enctype="multipart/form-data">
                <label for="file">Archivo de Factura:</label>
                <input type="file" id="file" name="file" accept=".xlsx,.csv" required>

                <label for="concepto">Concepto:</label>
                <input type="text" id="concepto" name="concepto" required>

                <label for="coste">Costo:</label>
                <input type="number" id="coste" name="coste" step="0.01" required>

                <label for="currency">Moneda:</label>
                <select id="currency" name="currency" required>
                    <option value="" disabled selected>Seleccione</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="GBP">GBP</option>
                    <option value="MXN">MXN</option>
                </select>

                <label for="tipo_factura">Tipo de Factura:</label>
                <select id="tipo_factura" name="tipo_factura" required>
                    <option value="" disabled selected>Seleccione</option>
                    <option value="cobrada">Cobrada</option>
                    <option value="pagada">Pagada</option>
                </select>

                <div class="popup-buttons">
                    <button type="submit">Aceptar</button>
                    <button type="button" id="cancelPopup">Cancelar</button>
                </div>
            </form>
        </div>
    </div>
`;

        document.body.insertAdjacentHTML('beforeend', popupHtml);

        // Configurar cierre del popup
        document.getElementById('cancelPopup').addEventListener('click', () => {
            document.getElementById('popup').remove();
        });

        // Configurar envío del formulario con el token CSRF
        document.getElementById('popupForm').addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData(event.target);

            // Reutiliza getCSRFToken definido en otro script
            const csrfToken = getCSRFToken();

            try {
                const response = await fetch('/procesamiento/upload/', {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': csrfToken,
                    },
                    body: formData,
                });

                if (!response.ok) throw new Error('Error al subir la factura.');

                alert('Factura subida correctamente.');
                document.getElementById('popup').remove();
            } catch (error) {
                alert('Error al subir la factura.');
                console.error(error);
            }
        });
    };

    if (uploadInvoiceButton) {
        uploadInvoiceButton.addEventListener('click', showPopup);
    }
};

