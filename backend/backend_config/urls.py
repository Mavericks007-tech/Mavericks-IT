from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('cms.api_urls')),
    path('api/v1/seo/', include('seo.urls')),
    path('api/v1/crm/', include('crm.urls')),
    path('api/v1/comms/', include('comms.urls')),
    path('api/v1/reports/', include('reports.urls')),
    path('api/v1/portal/', include('portal.urls')),
    path('api/v1/auth/', include('accounts.urls')),
    path('ckeditor5/', include('django_ckeditor_5.urls')),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
