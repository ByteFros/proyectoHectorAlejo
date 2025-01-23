from django import forms
from .models import Invoice

class InvoiceForm(forms.ModelForm):
    class Meta:
        model = Invoice
        fields = ['file', 'concepto', 'coste', 'tipo_factura']  # Incluir campos adicionales
