# accounts/urls.py
from django.urls import path
from . import views
from django.contrib.auth.views import LogoutView
from .views import get_user_profile

urlpatterns = [
    path('auth/', views.auth_view, name='auth'),
    path('logout/', LogoutView.as_view(next_page='auth'), name='logout'),  # Simplificado
    path('profile/', views.user_profile, name='user_profile'),
    path('profile/data/', get_user_profile, name='get_user_profile'),  # Nueva ruta

]