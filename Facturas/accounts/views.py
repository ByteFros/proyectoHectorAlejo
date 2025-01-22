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
        form_type = request.POST.get('form_type')

        if form_type == 'register':
            register_form = CustomUserCreationForm(request.POST)
            login_form = AuthenticationForm()  # Formulario vacío para el login
            if register_form.is_valid():
                try:
                    register_form.save()
                    messages.success(request, 'Usuario registrado con éxito. ¡Ahora puedes iniciar sesión!')
                    return redirect('auth')
                except ValidationError as e:
                    messages.error(request, e.message)
            else:
                messages.error(request, 'Por favor, corrige los errores del formulario de registro.')

        elif form_type == 'login':
            login_form = AuthenticationForm(data=request.POST)
            register_form = CustomUserCreationForm()  # Formulario vacío para el registro
            if login_form.is_valid():
                user = login_form.get_user()
                login(request, user)
                messages.success(request, f'¡Bienvenido, {user.username}!')
                return redirect('user_profile')
            else:
                messages.error(request, 'Usuario o contraseña incorrectos.')

    else:
        login_form = AuthenticationForm()
        register_form = CustomUserCreationForm()

    return render(request, 'accTemplates/auth.html', {
        'login_form': login_form,
        'register_form': register_form,
        'isLogin': True
    })
