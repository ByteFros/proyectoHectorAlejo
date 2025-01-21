# procesamientoArchivos/urls.py
from django.urls import path
from . import views

app_name = 'procesamientoArchivos'  # Para namespacing en las URLs

urlpatterns = [
    path('upload/', views.upload_invoice, name='subir_archivo'),
    path('download/<int:invoice_id>/', views.download_invoice, name='download_invoice'),
    path('list/', views.list_invoices, name='listar_descargas'),  # Ruta para listar facturas
]
