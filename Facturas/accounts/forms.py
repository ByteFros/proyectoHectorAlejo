from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

class CustomUserCreationForm(UserCreationForm):
    email = forms.EmailField(required=True)
    nif = forms.CharField(max_length=50, required=True, label="NIF")
    address = forms.CharField(max_length=255, required=True, label="Dirección")
    city = forms.CharField(max_length=100, required=True, label="Ciudad")
    postalCode = forms.CharField(max_length=20, required=True, label="Código Postal")

    class Meta:
        model = User
        fields = ('username', 'email', 'nif', 'address', 'city', 'postalCode', 'password1', 'password2')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['password1'].widget = forms.PasswordInput(attrs={'placeholder': 'Password', 'class': 'form-input'})
        self.fields['password2'].widget = forms.PasswordInput(attrs={'placeholder': 'Confirm Password', 'class': 'form-input'})

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data["email"]
        if commit:
            user.save()
        return user