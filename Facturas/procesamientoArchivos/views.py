from django.http import FileResponse, Http404, JsonResponse
from django.shortcuts import render
from .forms import InvoiceForm  # Cambia al nuevo formulario que incluye los campos adicionales
from django.shortcuts import get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from .models import Invoice

@login_required
def upload_invoice(request):
    if request.method == 'POST':
        form = InvoiceForm(request.POST, request.FILES)
        if form.is_valid():
            invoice = form.save(commit=False)
            invoice.user = request.user  # Asocia la factura al usuario actual
            invoice.save()
            return JsonResponse({'message': 'Factura subida correctamente.'}, status=200)
        else:
            # Retorna los errores de validación si los hay
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


from django.core.serializers import serialize

@login_required
def get_invoices_json(request):
    """
    Devuelve las facturas del usuario actual en formato JSON.
    """
    invoices = Invoice.objects.filter(user=request.user).order_by('concepto', '-uploaded_at')
    invoice_list = [
        {
            'id': invoice.id,
            'concept': invoice.concepto,
            'cost': invoice.coste,
            'type': invoice.tipo_factura,
            'fileUrl': invoice.file.url,  # URL del archivo
            'uploadedAt': invoice.uploaded_at.strftime('%Y-%m-%d %H:%M:%S')  # Formato legible
        }
        for invoice in invoices
    ]
    return JsonResponse(invoice_list, safe=False)
