from django.urls import path
from .views import upload_invoice, list_user_invoices, delete_invoice, view_invoice, preview_invoice, download_invoice

urlpatterns = [
    path('upload/', upload_invoice, name='upload_invoice'),
    path('invoices/', list_user_invoices, name='list_invoices'),
    path('invoices/<int:invoice_id>/delete/', delete_invoice, name='delete_invoice'),
    path('invoices/<int:invoice_id>/', view_invoice, name='view_invoice'),
    path('invoices/<int:invoice_id>/preview/', preview_invoice, name='preview_invoice'),
    path('invoices/<int:invoice_id>/download/', download_invoice, name='download_invoice'),
]
