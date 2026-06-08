from django.urls import path

from . import views

app_name = 'reports'

urlpatterns = [
    path('dashboard/', views.dashboard, name='dashboard'),
    path('sales-funnel/', views.sales_funnel, name='sales-funnel'),
    path('lead-sources/', views.lead_sources, name='lead-sources'),
    path('revenue/by-month/', views.revenue_by_month, name='revenue-by-month'),
    path('revenue/by-client/', views.revenue_by_client, name='revenue-by-client'),
    path('revenue/by-service/', views.revenue_by_service, name='revenue-by-service'),
    path('projects/profitability/', views.project_profitability, name='project-profitability'),
    path('team/performance/', views.team_performance, name='team-performance'),
    path('email/stats/', views.email_stats, name='email-stats'),
]
