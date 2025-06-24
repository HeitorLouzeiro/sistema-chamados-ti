from django.urls import path
from . import views

app_name = 'usuarios'

urlpatterns = [
    path('', views.UsuarioListCreateView.as_view(), name='usuario-list-create'),
    path('<int:pk>/', views.UsuarioDetailView.as_view(), name='usuario-detail'),
    path('tecnicos/', views.TecnicoListView.as_view(), name='tecnico-list'),
    path('perfil/', views.usuario_perfil, name='usuario-perfil'),
    path('perfil/atualizar/', views.atualizar_perfil, name='atualizar-perfil'),
]
