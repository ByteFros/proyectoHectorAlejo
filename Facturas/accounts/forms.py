from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.core.exceptions import ValidationError
from .models import CustomUser

class CustomUserCreationForm(UserCreationForm):
    email = forms.EmailField(required=True, label="Correo Electrónico")
    nif = forms.CharField(max_length=50, required=True, label="NIF")
    address = forms.CharField(max_length=255, required=True, label="Dirección")
    city = forms.CharField(max_length=100, required=True, label="Ciudad")
    postalCode = forms.CharField(max_length=20, required=True, label="Código Postal")
    company_logo = forms.ImageField(required=False, label="Logo de la Empresa")  # 📌 Nuevo campo

    password1 = forms.CharField(widget=forms.PasswordInput, label="Contraseña")
    password2 = forms.CharField(widget=forms.PasswordInput, label="Confirmar Contraseña")

    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'nif', 'address', 'city', 'postalCode', 'company_logo', 'password1', 'password2')

    def clean_password2(self):
        """Validar que las contraseñas coincidan."""
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")

        if password1 and password2 and password1 != password2:
            raise ValidationError("Las contraseñas no coinciden.")

        return password2

    def save(self, commit=True):
        """Guardar el usuario con la contraseña correctamente hasheada."""
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password1"])  # 🔥 Asegurar que la contraseña se guarde correctamente

        if commit:
            user.save()
        return user
