from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

app_name = 'comms'

router = DefaultRouter()
router.register('templates', views.EmailTemplateViewSet)
router.register('logs', views.EmailLogViewSet)
router.register('campaigns', views.EmailCampaignViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('track/<uuid:log_id>.gif', views.tracking_pixel, name='tracking-pixel'),
]
