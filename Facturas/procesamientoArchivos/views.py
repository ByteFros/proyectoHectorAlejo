from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from .models import Invoice
from .forms import InvoiceUploadForm
from django.http import FileResponse, Http404
import os


@login_required
def upload_invoice(request):
    if request.method == 'POST':
        form = InvoiceUploadForm(request.POST, request.FILES)
        if form.is_valid():
            invoice = form.save(commit=False)
            invoice.user = request.user
            invoice.save()
            return redirect('user_profile')  # Cambia por tu vista principal del usuario
    else:
        form = InvoiceUploadForm()
    return render(request, 'procesamientoArchivos/subirArchivo.html', {'form': form})



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