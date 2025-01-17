# proyectoDjango/urls.py
from django.contrib import admin
from django.shortcuts import redirect
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('accounts.urls')),  # Incluir las rutas de "accounts"
    path('', lambda request: redirect('login')),  # Redirige a login
]
