"""Custom admin REST API — replaces Django default UI for /manage/* pages.

All endpoints under /api/v1/cms/admin/ require IsAuthenticated. Permissions are
DRF model permissions on top of django-simple-history tracking.
"""
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.db import models as dj_models
from rest_framework import permissions, serializers, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

from comms.models import EmailSettings, EmailTemplate
from cms.models import (
    BlogPost, CaseStudy, CTASection, Differentiator, HeroSection, Industry,
    ProcessStep, Service, Testimonial, TrustStat,
)
from seo.models import MetaTag, SchemaOrg
from site_content.models import (
    FooterColumn, FooterLink, MediaAsset, NavItem, NavMenu, Page, Redirect,
    SiteSettings,
)

User = get_user_model()


# ---------------------------------------------------------------------------
# Serializers — auto-generated from model __all__-style introspection
# ---------------------------------------------------------------------------
def make_serializer(model_cls, exclude=('is_deleted',)):
    meta_cls = type('Meta', (), {'model': model_cls, 'exclude': exclude})
    return type(f'{model_cls.__name__}AdminSerializer', (serializers.ModelSerializer,), {'Meta': meta_cls})


HeroSectionSerializer    = make_serializer(HeroSection)
ServiceSerializer        = make_serializer(Service)
TestimonialSerializer    = make_serializer(Testimonial)
TrustStatSerializer      = make_serializer(TrustStat)
IndustrySerializer       = make_serializer(Industry)
CaseStudySerializer      = make_serializer(CaseStudy)
DifferentiatorSerializer = make_serializer(Differentiator)
ProcessStepSerializer    = make_serializer(ProcessStep)
BlogPostSerializer       = make_serializer(BlogPost)
CTASectionSerializer     = make_serializer(CTASection)

PageSerializer           = make_serializer(Page)
MediaAssetSerializer     = make_serializer(MediaAsset)
RedirectSerializer       = make_serializer(Redirect)
SiteSettingsSerializer   = make_serializer(SiteSettings)
NavMenuSerializer        = make_serializer(NavMenu)
NavItemSerializer        = make_serializer(NavItem)
FooterColumnSerializer   = make_serializer(FooterColumn)
FooterLinkSerializer     = make_serializer(FooterLink)

MetaTagSerializer        = make_serializer(MetaTag)
SchemaOrgSerializer      = make_serializer(SchemaOrg)

EmailSettingsSerializer  = make_serializer(EmailSettings)
EmailTemplateSerializer  = make_serializer(EmailTemplate)


# ---------------------------------------------------------------------------
# Base viewset — applies IsAuthenticated + records change_reason from header
# ---------------------------------------------------------------------------
class AdminEntityViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        obj = serializer.save()
        self._stamp_history(obj, 'created via /manage')

    def perform_update(self, serializer):
        obj = serializer.save()
        self._stamp_history(obj, 'updated via /manage')

    def perform_destroy(self, instance):
        self._stamp_history(instance, 'deleted via /manage')
        instance.delete()

    def _stamp_history(self, instance, reason):
        if hasattr(instance, 'history'):
            try:
                latest = instance.history.first()
                if latest:
                    latest.history_change_reason = reason
                    latest.history_user = self.request.user
                    latest.save()
            except Exception:
                pass


# ---------------------------------------------------------------------------
# CMS — content models
# ---------------------------------------------------------------------------
class HeroSectionViewSet(AdminEntityViewSet):
    queryset = HeroSection.objects.all().order_by('-is_active', '-updated_at')
    serializer_class = HeroSectionSerializer


class ServiceViewSet(AdminEntityViewSet):
    queryset = Service.objects.all().order_by('order')
    serializer_class = ServiceSerializer


class TestimonialViewSet(AdminEntityViewSet):
    queryset = Testimonial.objects.all().order_by('order')
    serializer_class = TestimonialSerializer


class TrustStatViewSet(AdminEntityViewSet):
    queryset = TrustStat.objects.all().order_by('order')
    serializer_class = TrustStatSerializer


class IndustryViewSet(AdminEntityViewSet):
    queryset = Industry.objects.all().order_by('order')
    serializer_class = IndustrySerializer


class CaseStudyViewSet(AdminEntityViewSet):
    queryset = CaseStudy.objects.all().order_by('order')
    serializer_class = CaseStudySerializer


class DifferentiatorViewSet(AdminEntityViewSet):
    queryset = Differentiator.objects.all().order_by('order')
    serializer_class = DifferentiatorSerializer


class ProcessStepViewSet(AdminEntityViewSet):
    queryset = ProcessStep.objects.all().order_by('step_number')
    serializer_class = ProcessStepSerializer


class BlogPostViewSet(AdminEntityViewSet):
    queryset = BlogPost.objects.all().order_by('-published_at')
    serializer_class = BlogPostSerializer


class CTASectionViewSet(AdminEntityViewSet):
    queryset = CTASection.objects.all().order_by('-is_active', '-updated_at')
    serializer_class = CTASectionSerializer


# ---------------------------------------------------------------------------
# Site content — Pages, Media, Nav, Footer, Redirects
# ---------------------------------------------------------------------------
class PageViewSet(AdminEntityViewSet):
    queryset = Page.objects.all().order_by('slug')
    serializer_class = PageSerializer


class MediaAssetViewSet(AdminEntityViewSet):
    queryset = MediaAsset.objects.all().order_by('-created_at')
    serializer_class = MediaAssetSerializer
    parser_classes = [MultiPartParser, FormParser]


class RedirectViewSet(AdminEntityViewSet):
    queryset = Redirect.objects.all().order_by('from_path')
    serializer_class = RedirectSerializer


class SiteSettingsViewSet(AdminEntityViewSet):
    """Singleton — UI calls /api/v1/cms/admin/site-settings/singleton/ to get the only row."""
    queryset = SiteSettings.objects.all()
    serializer_class = SiteSettingsSerializer

    @action(detail=False, methods=['get', 'patch'], url_path='singleton')
    def singleton(self, request):
        obj = SiteSettings.objects.first()
        if obj is None:
            obj = SiteSettings.objects.create()
        if request.method == 'PATCH':
            ser = self.get_serializer(obj, data=request.data, partial=True)
            ser.is_valid(raise_exception=True)
            self.perform_update(ser)
            return Response(ser.data)
        return Response(self.get_serializer(obj).data)


class NavMenuViewSet(AdminEntityViewSet):
    queryset = NavMenu.objects.all()
    serializer_class = NavMenuSerializer


class NavItemViewSet(AdminEntityViewSet):
    queryset = NavItem.objects.all().order_by('menu', 'order')
    serializer_class = NavItemSerializer


class FooterColumnViewSet(AdminEntityViewSet):
    queryset = FooterColumn.objects.all().order_by('order')
    serializer_class = FooterColumnSerializer


class FooterLinkViewSet(AdminEntityViewSet):
    queryset = FooterLink.objects.all().order_by('column', 'order')
    serializer_class = FooterLinkSerializer


# ---------------------------------------------------------------------------
# SEO
# ---------------------------------------------------------------------------
class MetaTagViewSet(AdminEntityViewSet):
    queryset = MetaTag.objects.all().order_by('path')
    serializer_class = MetaTagSerializer


class SchemaOrgViewSet(AdminEntityViewSet):
    queryset = SchemaOrg.objects.all().order_by('path', 'schema_type')
    serializer_class = SchemaOrgSerializer


# ---------------------------------------------------------------------------
# Email
# ---------------------------------------------------------------------------
class EmailSettingsViewSet(AdminEntityViewSet):
    queryset = EmailSettings.objects.all()
    serializer_class = EmailSettingsSerializer

    @action(detail=False, methods=['get', 'patch'], url_path='singleton')
    def singleton(self, request):
        obj = EmailSettings.objects.first()
        if obj is None:
            obj = EmailSettings.objects.create()
        if request.method == 'PATCH':
            ser = self.get_serializer(obj, data=request.data, partial=True)
            ser.is_valid(raise_exception=True)
            self.perform_update(ser)
            return Response(ser.data)
        return Response(self.get_serializer(obj).data)


class EmailTemplateViewSet(AdminEntityViewSet):
    queryset = EmailTemplate.objects.all().order_by('name')
    serializer_class = EmailTemplateSerializer


# ---------------------------------------------------------------------------
# Users + Groups
# ---------------------------------------------------------------------------
class UserAdminSerializer(serializers.ModelSerializer):
    groups = serializers.PrimaryKeyRelatedField(many=True, queryset=Group.objects.all())
    group_names = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'is_active', 'is_staff', 'is_superuser',
            'groups', 'group_names', 'last_login', 'date_joined', 'password',
        )
        read_only_fields = ('last_login', 'date_joined')

    def get_group_names(self, obj):
        return list(obj.groups.values_list('name', flat=True))

    def create(self, validated):
        groups = validated.pop('groups', [])
        password = validated.pop('password', None)
        user = User(**validated)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        user.groups.set(groups)
        return user

    def update(self, instance, validated):
        groups = validated.pop('groups', None)
        password = validated.pop('password', None)
        for k, v in validated.items():
            setattr(instance, k, v)
        if password:
            instance.set_password(password)
        instance.save()
        if groups is not None:
            instance.groups.set(groups)
        return instance


class GroupAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ('id', 'name')


class UserAdminViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = User.objects.all().order_by('username').prefetch_related('groups')
    serializer_class = UserAdminSerializer


class GroupAdminViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Group.objects.all().order_by('name')
    serializer_class = GroupAdminSerializer
