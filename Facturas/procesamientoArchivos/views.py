import openai
import pdfplumber
import pandas as pd
from django.http import FileResponse, Http404, JsonResponse, HttpResponse
from django.shortcuts import render
from .forms import InvoiceForm
from django.shortcuts import get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from .models import Invoice
from django.db.models import Sum
import logging
logger = logging.getLogger(__name__)


openai.api_key = 'TU_API_KEY_DE_OPENAI'

# views.py

@login_required
def upload_invoice(request):
    if request.method == 'POST':
        logger.info(f"POST data: {request.POST}")
        logger.info(f"FILES data: {request.FILES}")

        form = InvoiceForm(request.POST, request.FILES)
        if form.is_valid():
            invoice = form.save(commit=False)
            invoice.user = request.user
            invoice.save()
            return JsonResponse({'message': 'Factura subida correctamente.'}, status=200)
        else:
            logger.error(f"Errores del formulario: {form.errors}")
            return JsonResponse({'error': form.errors}, status=400)
    else:
        form = InvoiceForm()
    return render(request, 'procesamientoArchivos/subirFactura.html', {'form': form})


@login_required
def edit_invoice(request, invoice_id):
    if request.method == 'POST':
        invoice = get_object_or_404(Invoice, id=invoice_id, user=request.user)
        invoice.concepto = request.POST.get('concepto', invoice.concepto)
        invoice.coste = request.POST.get('coste', invoice.coste)
        invoice.formato = request.POST.get('formato', invoice.formato)
        invoice.save()
        return redirect('list_invoices')  # Redirige a la lista de facturas


@login_required
def download_invoice(request, invoice_id):
    try:
        invoice = Invoice.objects.get(id=invoice_id, user=request.user)
        if not invoice.file or not invoice.file.path:
            return JsonResponse({'error': 'El archivo no existe.'}, status=404)

        response = FileResponse(open(invoice.file.path, 'rb'), as_attachment=True)
        response['Content-Disposition'] = f'attachment; filename="{invoice.file.name}"'
        return response
    except Invoice.DoesNotExist:
        raise Http404("Factura no encontrada.")
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@login_required
def list_invoices(request):
    # Obtén todas las facturas del usuario actual, ordenadas por concepto y fecha
    invoices = Invoice.objects.filter(user=request.user).order_by('concepto', '-uploaded_at')
    return render(request, 'procesamientoArchivos/listadoDescargas.html', {'invoices': invoices})


@login_required
def delete_invoice(request, invoice_id):
    if request.method not in ['DELETE', 'POST']:
        return JsonResponse({'error': 'Método no permitido.'}, status=405)
    try:
        invoice = get_object_or_404(Invoice, id=invoice_id, user=request.user)
        invoice.delete()
        return JsonResponse({'message': 'Factura eliminada correctamente.'}, status=200)
    except Invoice.DoesNotExist:
        return JsonResponse({'error': 'Factura no encontrada.'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@login_required
def list_user_invoices(request):
    """
    Devuelve todas las facturas del usuario actual en formato JSON, permite filtrar por tipo de factura
    y calcula los totales de costos por tipo de factura.
    """
    try:
        # Obtener el parámetro de filtro desde la URL (opcional)
        invoice_type = request.GET.get('type', 'all')  # 'all', 'emitida' o 'recibida'
        invoices_query = Invoice.objects.filter(user=request.user)

        # Filtrar por tipo de factura si se especifica un tipo
        if invoice_type != 'all':
            invoices_query = invoices_query.filter(tipo_factura=invoice_type)

        # Calcular los totales de facturas "Cobradas" y "Pagadas"
        total_cobradas = \
        Invoice.objects.filter(user=request.user, tipo_factura='cobrada').aggregate(total=Sum('coste'))['total']
        total_pagadas = Invoice.objects.filter(user=request.user, tipo_factura='pagada').aggregate(total=Sum('coste'))[
            'total']

        total_cobradas = total_cobradas or 0.0
        total_pagadas = total_pagadas or 0.0

        # Serializar facturas para la respuesta
        invoices = [
            {
                'id': invoice.id,
                'concept': invoice.concepto,
                'cost': float(invoice.coste),
                'currency': invoice.currency,
                'type': invoice.tipo_factura,
                'fileUrl': invoice.file.url,
                'uploadedAt': invoice.uploaded_at.strftime('%Y-%m-%d %H:%M:%S'),
            }
            for invoice in invoices_query
        ]

        # Respuesta con facturas y totales
        return JsonResponse({
            'invoices': invoices,
            'totals': {
                'cobradas': total_cobradas,
                'pagadas': total_pagadas,
            }
        }, safe=False, status=200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@login_required
def view_invoice(request, invoice_id):
    """
    Devuelve los detalles de una factura específica.
    """
    try:
        invoice = get_object_or_404(Invoice, id=invoice_id, user=request.user)
        data = {
            'id': invoice.id,
            'concept': invoice.concepto,
            'cost': float(invoice.coste),
            'type': invoice.tipo_factura,
            'currency': invoice.currency,
            'fileUrl': invoice.file.url,
            'uploadedAt': invoice.uploaded_at.strftime('%Y-%m-%d %H:%M:%S'),
        }
        return JsonResponse(data, status=200)
    except Invoice.DoesNotExist:
        return JsonResponse({'error': 'Factura no encontrada.'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@login_required
def preview_invoice(request, invoice_id):
    invoice = get_object_or_404(Invoice, id=invoice_id, user=request.user)
    file_path = invoice.file.path

    extracted_data = analyze_invoice_with_chatgpt(file_path)
    return JsonResponse({"invoice": invoice.id, "data": extracted_data}, status=200)

def extract_text_from_pdf(file_path):
    """Extrae el texto de un PDF."""
    with pdfplumber.open(file_path) as pdf:
        return "\n".join(page.extract_text() for page in pdf.pages if page.extract_text())

def extract_data_from_excel(file_path):
    """Convierte un archivo Excel en un string legible."""
    df = pd.read_excel(file_path)
    return df.to_csv(index=False, sep="\t")  # Formateamos como texto tabulado

def extract_data_from_csv(file_path):
    """Convierte un CSV en un string legible."""
    df = pd.read_csv(file_path)
    return df.to_csv(index=False, sep="\t")

def analyze_invoice_with_chatgpt(file_path):
    """Extrae datos de una factura y los analiza con OpenAI."""
    if file_path.endswith('.pdf'):
        extracted_text = extract_text_from_pdf(file_path)
    elif file_path.endswith('.xls') or file_path.endswith('.xlsx'):
        extracted_text = extract_data_from_excel(file_path)
    elif file_path.endswith('.csv'):
        extracted_text = extract_data_from_csv(file_path)
    else:
        return {"error": "Formato de archivo no compatible."}

    if not extracted_text:
        return {"error": "No se pudo extraer texto del archivo."}

    prompt = f"""
    Analiza la siguiente factura y extrae los datos clave:
    - Concepto
    - Costo
    - Moneda
    - Fecha
    - Tipo de factura (cobrada/pagada)

    Datos de la factura:
    {extracted_text}
    """

    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "Eres un asistente experto en análisis de facturas."},
            {"role": "user", "content": prompt}
        ]
    )

    return response["choices"][0]["message"]["content"]