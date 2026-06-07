from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User

from .models import (
    HeroSection, TrustStat, Service, Industry, CaseStudy,
    Differentiator, ProcessStep, Testimonial, BlogPost, CTASection,
)


class CustomUserAdmin(UserAdmin):
    def get_fieldsets(self, request, obj=None):
        if not request.user.is_superuser:
            fieldsets = list(super().get_fieldsets(request, obj))
            return [fs for fs in fieldsets if fs[0] != 'Password']
        return super().get_fieldsets(request, obj)

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        if not request.user.is_superuser and 'password' in form.base_fields:
            del form.base_fields['password']
        return form


admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)


@admin.register(HeroSection)
class HeroSectionAdmin(admin.ModelAdmin):
    list_display = ('headline', 'is_active', 'updated_at')
    list_filter = ('is_active',)
    search_fields = ('headline', 'subheadline')
    fieldsets = (
        ('Content', {'fields': ('headline', 'subheadline')}),
        ('Primary CTA', {'fields': ('primary_cta_text', 'primary_cta_link')}),
        ('Secondary CTA', {'fields': ('secondary_cta_text', 'secondary_cta_link')}),
        ('Visual', {'fields': ('gradient_start', 'gradient_end', 'particle_count')}),
        ('Status', {'fields': ('is_active',)}),
    )

    def has_add_permission(self, request):
        return not HeroSection.objects.exists()


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('title', 'subtitle', 'order', 'is_featured', 'icon_name')
    list_filter = ('is_featured',)
    search_fields = ('title', 'subtitle', 'simple_explanation')
    list_editable = ('order', 'is_featured')
    ordering = ('order',)


@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ('name', 'company', 'rating', 'is_featured', 'order')
    list_filter = ('is_featured', 'rating')
    search_fields = ('name', 'company', 'content', 'service_used')
    list_editable = ('is_featured', 'order')


@admin.register(TrustStat)
class TrustStatAdmin(admin.ModelAdmin):
    list_display = ('label', 'value', 'numeric_value', 'order', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('label',)
    list_editable = ('order', 'is_active')


@admin.register(Industry)
class IndustryAdmin(admin.ModelAdmin):
    list_display = ('name', 'icon_name', 'order', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name', 'description', 'example_service')
    list_editable = ('order', 'is_active')


@admin.register(CaseStudy)
class CaseStudyAdmin(admin.ModelAdmin):
    list_display = ('title', 'client_name', 'industry', 'metric', 'is_featured', 'order')
    list_filter = ('is_featured', 'industry')
    search_fields = ('title', 'client_name', 'description', 'challenge', 'solution')
    list_editable = ('is_featured', 'order')


@admin.register(Differentiator)
class DifferentiatorAdmin(admin.ModelAdmin):
    list_display = ('title', 'icon_name', 'order')
    search_fields = ('title', 'description')
    list_editable = ('order',)


@admin.register(ProcessStep)
class ProcessStepAdmin(admin.ModelAdmin):
    list_display = ('step_number', 'title', 'duration', 'order')
    search_fields = ('title', 'description')
    list_editable = ('order',)
    ordering = ('step_number',)


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'category', 'is_published', 'published_at', 'views')
    list_filter = ('is_published', 'category', 'author')
    search_fields = ('title', 'excerpt', 'content', 'author')
    prepopulated_fields = {'slug': ('title',)}
    list_editable = ('is_published',)
    readonly_fields = ('views',)
    date_hierarchy = 'published_at'


@admin.register(CTASection)
class CTASectionAdmin(admin.ModelAdmin):
    list_display = ('headline', 'is_active', 'updated_at')
    list_filter = ('is_active',)
    search_fields = ('headline', 'subtext')

    def has_add_permission(self, request):
        return not CTASection.objects.exists()
