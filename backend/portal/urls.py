from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

app_name = 'portal'

router = DefaultRouter()
router.register('projects', views.PortalProjectViewSet, basename='portal-projects')
router.register('milestones', views.PortalMilestoneViewSet, basename='portal-milestones')
router.register('invoices', views.PortalInvoiceViewSet, basename='portal-invoices')
router.register('quotes', views.PortalQuoteViewSet, basename='portal-quotes')
router.register('payments', views.PortalPaymentViewSet, basename='portal-payments')

urlpatterns = [
    path('me/', views.portal_me, name='me'),
    path('request-access/', views.request_portal_access, name='request-access'),
    path('', include(router.urls)),
]
