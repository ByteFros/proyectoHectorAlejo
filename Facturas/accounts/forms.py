from django import forms
from django.contrib.auth.forms import UserCreationForm

from .models import CustomUser
from django.core.exceptions import ValidationError

class CustomUserCreationForm(UserCreationForm):
    email = forms.EmailField(required=True, label="Correo Electrónico")
    nif = forms.CharField(max_length=50, required=True, label="NIF")
    address = forms.CharField(max_length=255, required=True, label="Dirección")
    city = forms.CharField(max_length=100, required=True, label="Ciudad")
    postalCode = forms.CharField(max_length=20, required=True, label="Código Postal")

    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'nif', 'address', 'city', 'postalCode', 'password1', 'password2')

    def save(self, commit=True):
        # Validación de unicidad de `username`
        if CustomUser.objects.filter(username=self.cleaned_data['username']).exists():
            raise ValidationError(f"El nombre de usuario '{self.cleaned_data['username']}' ya está en uso.")

        user = super().save(commit=False)
        user.email = self.cleaned_data["email"]
        if commit:
            user.save()
        return user
