from django.urls import path
from . import views

app_name = 'chamados'

urlpatterns = [
    path('tipos-servico/', views.TipoServicoListView.as_view(), name='tipo-servico-list'),
    path('', views.ChamadoListCreateView.as_view(), name='chamado-list-create'),
    path('<int:pk>/', views.ChamadoDetailView.as_view(), name='chamado-detail'),
    path('<int:pk>/status/', views.atualizar_status_chamado, name='atualizar-status'),
    path('meus-chamados/', views.meus_chamados, name='meus-chamados'),
    path('chamados-tecnico/', views.chamados_tecnico, name='chamados-tecnico'),
    path('<int:chamado_id>/anexos/', views.upload_anexo, name='upload-anexo'),
    path('anexos/<int:anexo_id>/', views.deletar_anexo, name='deletar-anexo'),
    path('estatisticas/', views.estatisticas_dashboard, name='estatisticas'),
]
