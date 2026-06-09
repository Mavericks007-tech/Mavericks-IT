from django.urls import path
from . import api_views

urlpatterns = [
    path('homepage/', api_views.homepage_data, name='homepage-data'),
    path('site/', api_views.site_settings, name='site-settings'),
    path('seo/', api_views.seo_meta, name='seo-meta'),
    path('services/', api_views.services_list, name='services-list'),
    path('services/<slug:slug>/', api_views.service_detail, name='service-detail'),
    path('industries/', api_views.industries_list, name='industries-list'),
    path('industries/<slug:slug>/', api_views.industry_detail, name='industry-detail'),
    path('pages/<slug:slug>/', api_views.page_detail, name='page-detail'),
    path('blog/', api_views.blog_list, name='blog-list'),
    path('blog/<slug:slug>/', api_views.blog_detail, name='blog-detail'),
    path('portfolio/', api_views.portfolio_list, name='portfolio-list'),
    path('portfolio/<uuid:pk>/', api_views.portfolio_detail, name='portfolio-detail'),
]
