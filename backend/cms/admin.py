from django.contrib import admin
from .models import (
    HeroSection, TrustStat, Service, Industry, CaseStudy,
    Differentiator, ProcessStep, Testimonial, BlogPost, CTASection
)

@admin.register(HeroSection)
class HeroSectionAdmin(admin.ModelAdmin):
    list_display = ['headline', 'is_active', 'updated_at']
    fieldsets = [
        ('Content', {'fields': ['headline', 'subheadline']}),
        ('CTA Buttons', {'fields': ['primary_cta_text', 'primary_cta_link', 'secondary_cta_text', 'secondary_cta_link']}),
        ('Visual', {'fields': ['gradient_start', 'gradient_end', 'particle_count']}),
        ('Status', {'fields': ['is_active']}),
    ]

@admin.register(TrustStat)
class TrustStatAdmin(admin.ModelAdmin):
    list_display = ['label', 'value', 'order', 'is_active']
    list_editable = ['order', 'is_active']

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ['title', 'order', 'is_featured']
    list_editable = ['order', 'is_featured']
    search_fields = ['title']

@admin.register(Industry)
class IndustryAdmin(admin.ModelAdmin):
    list_display = ['name', 'order', 'is_active']
    list_editable = ['order', 'is_active']

@admin.register(CaseStudy)
class CaseStudyAdmin(admin.ModelAdmin):
    list_display = ['title', 'client_name', 'industry', 'is_featured']
    list_filter = ['industry', 'is_featured']
    search_fields = ['title', 'client_name']

@admin.register(Differentiator)
class DifferentiatorAdmin(admin.ModelAdmin):
    list_display = ['title', 'order']
    list_editable = ['order']

@admin.register(ProcessStep)
class ProcessStepAdmin(admin.ModelAdmin):
    list_display = ['step_number', 'title', 'duration']
    list_editable = ['duration']

@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ['name', 'company', 'rating', 'is_featured']
    list_filter = ['rating', 'is_featured']
    search_fields = ['name', 'company']

@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'is_published', 'published_at']
    list_filter = ['is_published', 'category']
    prepopulated_fields = {'slug': ['title']}
    search_fields = ['title', 'content']

@admin.register(CTASection)
class CTASectionAdmin(admin.ModelAdmin):
    list_display = ['headline', 'is_active']
