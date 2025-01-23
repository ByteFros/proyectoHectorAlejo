# accounts/views.py
from django.contrib import messages
from django.contrib.auth import login
from django.core.exceptions import ValidationError
from django.shortcuts import render, redirect
from django.contrib.auth.forms import AuthenticationForm
from .forms import CustomUserCreationForm
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.utils.timezone import now


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
    user = request.user  # Usuario autenticado

    if request.method == 'POST':
        # Actualizar los campos del usuario
        user.email = request.POST.get('email', user.email)
        user.address = request.POST.get('address', user.address)
        user.city = request.POST.get('city', user.city)
        user.postalCode = request.POST.get('postalCode', user.postalCode)
        user.save()

        messages.success(request, 'Perfil actualizado correctamente.')
        return redirect('user_profile')  # Redirigir para evitar reenvío del formulario

    return render(request, 'accTemplates/userProfile.html', {
        'user': user  # Pasar el usuario al contexto
    })


@login_required
def get_user_profile(request):
    user = request.user
    data = {
        'username': user.username,
        'email': user.email,
        'nif': user.nif,
        'address': user.address,
        'city': user.city,
        'postalCode': user.postalCode,
    }
    return JsonResponse(data)


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



def my_view(request):
    return render(request, 'my_template.html', {'timestamp': int(now().timestamp())})
