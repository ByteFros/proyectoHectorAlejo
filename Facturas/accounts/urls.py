# accounts/urls.py
from django.urls import path
from . import views
from django.contrib.auth.views import LoginView, LogoutView
from .views import logout_confirm

urlpatterns = [
    path('auth/', views.auth_view, name='auth'),
    #path('register/', views.register, name='register'),
   #xpath('login/', LoginView.as_view(template_name='accTemplates/login.html'), name='login'),
    path('logout/', LogoutView.as_view(next_page='auth'), name='logout'),  # Simplificado
    path('profile/', views.user_profile, name='user_profile'),
]