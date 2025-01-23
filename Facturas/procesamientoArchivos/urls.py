from django.urls import path
from .views import upload_invoice, list_invoices, download_invoice, get_invoices_json

urlpatterns = [
    path('upload/', upload_invoice, name='upload_invoice'),
    path('list/', list_invoices, name='list_invoices'),
    path('download/<int:invoice_id>/', download_invoice, name='download_invoice'),
    path('invoices/', get_invoices_json, name='get_invoices_json'),  # Nueva ruta
]