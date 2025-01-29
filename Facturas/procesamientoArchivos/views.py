from django.http import FileResponse, Http404, JsonResponse
from django.shortcuts import render
from .forms import InvoiceForm  # Cambia al nuevo formulario que incluye los campos adicionales
from django.shortcuts import get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from .models import Invoice
import logging
from django.db.models import Sum

logger = logging.getLogger(__name__)


# views.py

@login_required
def upload_invoice(request):
    if request.method == 'POST':
        logger.info(f"POST data: {request.POST}")  # Log para depuración
        logger.info(f"FILES data: {request.FILES}")  # Log para depuración

        form = InvoiceForm(request.POST, request.FILES)
        if form.is_valid():
            invoice = form.save(commit=False)
            invoice.user = request.user  # Asocia la factura al usuario actual
            invoice.save()
            return JsonResponse({'message': 'Factura subida correctamente.'}, status=200)
        else:
            logger.error(f"Errores del formulario: {form.errors}")  # Log para errores
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
        response = FileResponse(open(invoice.file.path, 'rb'))
        return response
    except Invoice.DoesNotExist:
        raise Http404("Factura no encontrada.")


@login_required
def list_invoices(request):
    # Obtén todas las facturas del usuario actual, ordenadas por concepto y fecha
    invoices = Invoice.objects.filter(user=request.user).order_by('concepto', '-uploaded_at')
    return render(request, 'procesamientoArchivos/listadoDescargas.html', {'invoices': invoices})


@login_required
def delete_invoice(request, invoice_id):
    """
    Elimina una factura específica si pertenece al usuario autenticado.
    """
    if request.method != 'DELETE':
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
