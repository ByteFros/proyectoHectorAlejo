from django.conf import settings
from django.db import models

class Invoice(models.Model):
    TIPO_FACTURA_CHOICES = [
        ('cobrada', 'Cobrada'),
        ('pagada', 'Pagada'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    file = models.FileField(upload_to='invoices/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    concepto = models.CharField(max_length=255, default='Concepto no declarado por el usuario alalala')
    coste = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    tipo_factura = models.CharField(max_length=10, choices=TIPO_FACTURA_CHOICES, default='pagada')  # Cambiado de 'formato' a 'tipo_factura'

    def __str__(self):
        return f"Factura de {self.user.username} | Concepto: {self.concepto} | Subida el {self.uploaded_at}"

    class Meta:
        ordering = ['concepto', '-uploaded_at']  # Ordenar por concepto y fecha de subida
