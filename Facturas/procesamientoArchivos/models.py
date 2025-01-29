from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models



class Invoice(models.Model):
    CURRENCY_CHOICES = [
        ('EUR', 'Euro (€)'),
        ('USD', 'Dólar estadounidense ($)'),
        ('GBP', 'Libra esterlina (£)'),
        ('MXN', 'Peso mexicano (MXN)'),
    ]
    TIPO_FACTURA_CHOICES = [
        ('cobrada', 'Cobrada'),
        ('pagada', 'Pagada'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    file = models.FileField(upload_to='invoices/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    concepto = models.CharField(max_length=255)
    coste = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    tipo_factura = models.CharField(max_length=10, choices=TIPO_FACTURA_CHOICES,
                                    default='pagada')  # Cambiado de 'formato' a 'tipo_factura'
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default='MXN')  # Nuevo campo

    def __str__(self):
        return f"Factura de {self.user.username} | {self.concepto} | {self.coste} {self.currency}"

    class Meta:
        ordering = ['concepto', '-uploaded_at']
        indexes = [
            models.Index(fields=['uploaded_at']),
            models.Index(fields=['tipo_factura']),
        ]


def upload_to(instance, filename):
    import os
    from uuid import uuid4
    ext = filename.split('.')[-1]
    filename = f"{uuid4().hex}.{ext}"
    return os.path.join('invoices', filename)


file = models.FileField(upload_to=upload_to)


def clean(self):
    if self.coste < 0:
        raise ValidationError('El coste no puede ser negativo.')
