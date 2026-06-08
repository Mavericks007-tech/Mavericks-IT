from django.urls import path
from . import api_views

urlpatterns = [
    path('homepage/', api_views.homepage_data, name='homepage-data'),
    path('site/', api_views.site_settings, name='site-settings'),
    path('seo/', api_views.seo_meta, name='seo-meta'),
]
