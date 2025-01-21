from .models import Invoice
from django.http import FileResponse, Http404
import os
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from .forms import InvoiceUploadForm

@login_required
def upload_invoice(request):
    if request.method == 'POST':
        form = InvoiceUploadForm(request.POST, request.FILES)
        if form.is_valid():
            invoice = form.save(commit=False)
            invoice.user = request.user  # Asocia la factura al usuario actual
            invoice.save()
            return JsonResponse({'message': 'Factura subida correctamente.'}, status=200)
        else:
            return JsonResponse({'error': 'Formulario no válido.'}, status=400)
    return JsonResponse({'error': 'Método no permitido.'}, status=405)
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
    # Obtén todas las facturas del usuario actual
    invoices = Invoice.objects.filter(user=request.user)
    return render(request, 'procesamientoArchivos/listadoDescargas.html', {'invoices': invoices})