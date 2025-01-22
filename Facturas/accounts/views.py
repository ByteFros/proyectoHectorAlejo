# accounts/views.py
from django.contrib import messages
from django.contrib.auth import login
from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
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
    if request.method == 'POST':
        form_type = request.POST.get('form_type')  # Saber si es login o registro

        if form_type == 'login':  # Manejo de Login
            login_form = AuthenticationForm(data=request.POST)
            register_form = CustomUserCreationForm()  # Formulario vacío de registro
            if login_form.is_valid():
                user = login_form.get_user()
                login(request, user)
                messages.success(request, f'¡Bienvenido, {user.username}!')
                return redirect('user_profile')
            else:
                messages.error(request, 'Usuario o contraseña incorrectos.')

        elif form_type == 'register':  # Manejo de Registro
            register_form = CustomUserCreationForm(request.POST)
            login_form = AuthenticationForm()  # Formulario vacío de login
            if register_form.is_valid():
                register_form.save()
                messages.success(request, 'Usuario registrado con éxito. ¡Ahora puedes iniciar sesión!')
                return redirect('auth')
            else:
                messages.error(request, 'Por favor, corrige los errores del formulario de registro.')

    else:  # Si es una solicitud GET
        login_form = AuthenticationForm()
        register_form = CustomUserCreationForm()

    return render(request, 'accTemplates/auth.html', {
        'login_form': login_form,
        'register_form': register_form,
        'isLogin': True  # Por defecto, mostramos el formulario de login
    })