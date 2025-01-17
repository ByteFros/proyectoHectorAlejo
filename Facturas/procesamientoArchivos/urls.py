from django.urls import path
from . import views

app_name = 'procesamientoArchivos'  # Para permitir namespacing en las rutas

urlpatterns = [
    path('upload/', views.upload_invoice, name='subir_archivo'),
    path('download/<int:invoice_id>/', views.download_invoice, name='download_invoice'),
    path('list/', views.list_invoices, name='listar_descargas'),  # Nueva ruta para listar facturas
]