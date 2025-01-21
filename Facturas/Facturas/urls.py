# proyectoDjango/urls.py
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from django.shortcuts import redirect

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('accounts.urls')),  # Incluir las rutas de "accounts"
    path('', lambda request: redirect('login')),  # Redirige a login
    path('procesamiento/', include('procesamientoArchivos.urls')),  # Incluye las URLs de la app procesamientoArchivos
]

# Solo en desarrollo: Servir archivos desde MEDIA_URL
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
