from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate
from django.contrib.auth.decorators import login_required
from django.views import View
from .forms import CustomUserCreationForm, LoginForm, RegisterForm
from django.contrib.auth.views import LogoutView  # Importa la clase LogoutView de Django
from django.urls import reverse_lazy


class AuthView(View):
    def get(self, request):
        login_form = LoginForm()
        register_form = RegisterForm()
        return render(request, 'accounts/auth.html', {
            'login_form': login_form,
            'register_form': register_form,
        })

    def post(self, request):
        global login_form, register_form
        if 'login' in request.POST:  # Si el usuario está intentando iniciar sesión
            login_form = LoginForm(request.POST)
            register_form = RegisterForm()

            if login_form.is_valid():
                user = authenticate(
                    username=login_form.cleaned_data['username'],
                    password=login_form.cleaned_data['password']
                )
                if user:
                    login(request, user)
                    return redirect('home')  # Redirige al usuario después del login
        elif 'register' in request.POST:  # Si el usuario está intentando registrarse
            register_form = RegisterForm(request.POST)
            login_form = LoginForm()

            if register_form.is_valid():
                user = register_form.save(commit=False)
                user.set_password(register_form.cleaned_data['password'])
                user.save()
                login(request, user)  # Autentica automáticamente al nuevo usuario
                return redirect('home')  # Redirige al usuario después del registro

        # Si algo falla, renderiza la página con los errores
        return render(request, 'accounts/auth.html', {
            'login_form': login_form,
            'register_form': register_form,
        })

class CustomLogoutView(LogoutView):
    """
    Clase personalizada para permitir logout con solicitudes GET.
    """

    def get(self, request, *args, **kwargs):
        return self.post(request, *args, **kwargs)  # Sobrescribe el método GET para que llame al método POST

    # Redirigir al home después del logout
    next_page = reverse_lazy('accounts:home')  # Cambia 'home' si el namespace es diferente


def home(request):
    return render(request, 'accounts/home.html')


def login_view(request):
    return render(request, 'register/login.html')



def register(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('accounts:home')
    else:
        form = CustomUserCreationForm()
    return render(request, 'registration/register.html', {'form': form})


@login_required
def profile(request):
    return render(request, 'accounts/profile.html')
