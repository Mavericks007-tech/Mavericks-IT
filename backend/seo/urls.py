from django.urls import path

from . import views

urlpatterns = [
    path('sitemap-feed/', views.sitemap_feed, name='sitemap-feed'),
    path('robots-policy/', views.robots_policy, name='robots-policy'),
]
