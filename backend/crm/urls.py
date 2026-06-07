from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register('clients', views.ClientViewSet)
router.register('contacts', views.ContactViewSet)
router.register('leads', views.LeadViewSet)
router.register('projects', views.ProjectViewSet)
router.register('milestones', views.MilestoneViewSet)
router.register('quotes', views.QuoteViewSet)
router.register('invoices', views.InvoiceViewSet)
router.register('payments', views.PaymentViewSet)
router.register('tasks', views.TaskViewSet)
router.register('activities', views.ActivityViewSet)
router.register('notes', views.NoteViewSet)
router.register('public/leads', views.PublicLeadView, basename='public-leads')

urlpatterns = [
    path('', include(router.urls)),
]
