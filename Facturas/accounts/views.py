# accounts/views.py
from django.contrib import messages
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.http import HttpResponse
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


def auth_view(request):
    if request.method == "POST":
        if "loginForm" in request.POST:
            # Procesar formulario de login
            username = request.POST.get("username")
            password = request.POST.get("password")
            user = authenticate(request, username=username, password=password)
            if user:
                login(request, user)
                messages.success(request, "Inicio de sesión exitoso.")
                return redirect("user_profile")  # Cambia 'home' por la vista principal de tu aplicación
            else:
                messages.error(request, "Credenciales inválidas. Por favor, inténtalo de nuevo.")

        elif "registerForm" in request.POST:
            # Procesar formulario de registro manualmente
            username = request.POST.get("username")
            email = request.POST.get("email")
            password = request.POST.get("password")
            confirm_password = request.POST.get("confirmPassword")

            # Validar los campos del formulario
            if password != confirm_password:
                messages.error(request, "Las contraseñas no coinciden.")
            elif User.objects.filter(username=username).exists():
                messages.error(request, "El nombre de usuario ya está registrado.")
            elif User.objects.filter(email=email).exists():
                messages.error(request, "El correo electrónico ya está registrado.")
            else:
                # Crear nuevo usuario
                user = User.objects.create_user(username=username, email=email, password=password)
                user.save()
                messages.success(request, "Registro exitoso. Ahora puedes iniciar sesión.")
                return redirect("auth")  # Redirigir al mismo endpoint para iniciar sesión

    return render(request, "accTemplates/index.html")  # Renderizar el archivo HTML


def test_auth(request):
    return HttpResponse("<h1>Hola mundo</h1>")