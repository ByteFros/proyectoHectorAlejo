from django.conf import settings
from django.db import models

class Invoice(models.Model):
    FORMAT_CHOICES = [
        ('number', 'Número'),
        ('currency', 'Moneda'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    file = models.FileField(upload_to='invoices/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    concepto = models.CharField(max_length=255, default='Concepto no declarado por el usuario alalala')  # Campo para el concepto
    coste = models.DecimalField(max_digits=10, decimal_places=2,default = 0.00)  # Costo de la factura
    formato = models.CharField(max_length=10, choices=FORMAT_CHOICES, default='currency')  # Número o Moneda

    def __str__(self):
        return f"Factura de {self.user.username} | Concepto: {self.concepto} | Subida el {self.uploaded_at}"

    class Meta:
        ordering = ['concepto', '-uploaded_at']  # Ordenar por concepto y fecha de subida
