# accounts/urls.py
from django.urls import path
from . import views
from django.contrib.auth.views import LoginView, LogoutView
from .views import logout_confirm

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', LoginView.as_view(template_name='accTemplates/login.html'), name='login'),
    path('logout/', logout_confirm, name='logoutConfirm'),
    path('logout/confirm/', LogoutView.as_view(next_page='login'), name='logout'),
    path('profile/', views.user_profile, name='user_profile'),
]
