from django.urls import path
from . import views
from .auth_views import login_view, logout_view

app_name = 'usuarios'

urlpatterns = [
    # Autenticação
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    
    # Usuários
    path('', views.UsuarioListCreateView.as_view(), name='usuario-list-create'),
    path('<int:pk>/', views.UsuarioDetailView.as_view(), name='usuario-detail'),
    path('tecnicos/', views.TecnicoListView.as_view(), name='tecnico-list'),
    path('perfil/', views.usuario_perfil, name='usuario-perfil'),
    path('perfil/atualizar/', views.atualizar_perfil, name='atualizar-perfil'),
]
