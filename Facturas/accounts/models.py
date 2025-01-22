from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    nif = models.CharField(max_length=50, null=True, blank=True)
    address = models.CharField(max_length=255, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    postalCode = models.CharField(max_length=20, null=True, blank=True)

    def __str__(self):
        return self.username
