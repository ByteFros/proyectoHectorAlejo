# accounts/views.py
from django.contrib import messages
from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from .forms import CustomUserCreationForm


def register(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Usuario registrado con éxito.')
            return redirect('login')  # Redirige al login tras registrarse
    else:
        form = CustomUserCreationForm()
    return render(request, 'accTemplates/register.html', {'form': form})


@login_required
def user_profile(request):
    return render(request, 'accTemplates/userProfile.html')


def logout_confirm(request):
    return render(request, 'accTemplates/logoutConfirm.html')