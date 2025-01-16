from django.urls import path
from django.contrib.auth import views as auth_views
from . import views
from .views import AuthView

app_name = 'accounts'

urlpatterns = [
    path('login/', auth_views.LoginView.as_view(template_name='registration/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('auth/', AuthView.as_view(), name='auth'),
    path('register/', views.register, name='register'),
    path('profile/', views.profile, name='profile'),
    path('/', views.home, name='home'),  # La URL principal para "home"
]
