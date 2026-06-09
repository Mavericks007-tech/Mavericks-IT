"""Wire all admin viewsets under /api/v1/cms/admin/<entity>/."""
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import admin_api as a

router = DefaultRouter()

# Content
router.register('hero-sections',  a.HeroSectionViewSet,    basename='hero-sections')
router.register('services',       a.ServiceViewSet,        basename='services')
router.register('testimonials',   a.TestimonialViewSet,    basename='testimonials')
router.register('trust-stats',    a.TrustStatViewSet,      basename='trust-stats')
router.register('industries',     a.IndustryViewSet,       basename='industries')
router.register('case-studies',   a.CaseStudyViewSet,      basename='case-studies')
router.register('differentiators', a.DifferentiatorViewSet, basename='differentiators')
router.register('process-steps',  a.ProcessStepViewSet,    basename='process-steps')
router.register('blog-posts',     a.BlogPostViewSet,       basename='blog-posts')
router.register('cta-sections',   a.CTASectionViewSet,     basename='cta-sections')

# Site content
router.register('pages',          a.PageViewSet,           basename='pages')
router.register('media',          a.MediaAssetViewSet,     basename='media')
router.register('redirects',      a.RedirectViewSet,       basename='redirects')
router.register('site-settings',  a.SiteSettingsViewSet,   basename='site-settings')
router.register('nav-menus',      a.NavMenuViewSet,        basename='nav-menus')
router.register('nav-items',      a.NavItemViewSet,        basename='nav-items')
router.register('footer-columns', a.FooterColumnViewSet,   basename='footer-columns')
router.register('footer-links',   a.FooterLinkViewSet,     basename='footer-links')

# SEO
router.register('meta-tags',      a.MetaTagViewSet,        basename='meta-tags')
router.register('schemas',        a.SchemaOrgViewSet,      basename='schemas')

# Email
router.register('email-settings', a.EmailSettingsViewSet,  basename='email-settings')
router.register('email-templates', a.EmailTemplateViewSet, basename='email-templates')

# Users + Groups
router.register('users',          a.UserAdminViewSet,      basename='users')
router.register('groups',         a.GroupAdminViewSet,     basename='groups')


urlpatterns = [
    path('', include(router.urls)),
]
