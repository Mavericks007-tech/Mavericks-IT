from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from core.models import BaseModel

class HeroSection(BaseModel):
    """Hero section content - singleton"""
    headline = models.CharField(max_length=200, default="Bangladesh's Most Trusted Technology Partner")
    subheadline = models.TextField(default="We design, develop, and deploy world-class software, websites, and digital solutions for ambitious businesses")
    primary_cta_text = models.CharField(max_length=50, default="Get a Free Consultation")
    primary_cta_link = models.CharField(max_length=200, default="/contact")
    secondary_cta_text = models.CharField(max_length=50, default="View Our Work")
    secondary_cta_link = models.CharField(max_length=200, default="/portfolio")
    gradient_start = models.CharField(max_length=20, default="#0066FF")
    gradient_end = models.CharField(max_length=20, default="#00D9FF")
    particle_count = models.IntegerField(default=50)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'cms_hero_section'
    
    def save(self, *args, **kwargs):
        if not self.pk and HeroSection.objects.exists():
            raise ValidationError("Only one HeroSection can exist")
        super().save(*args, **kwargs)

class Service(BaseModel):
    """Service cards displayed on homepage"""
    title = models.CharField(max_length=100)
    subtitle = models.CharField(max_length=200)
    simple_explanation = models.TextField()
    icon_name = models.CharField(max_length=50)
    gradient_from = models.CharField(max_length=20, default="#00D9FF")
    gradient_to = models.CharField(max_length=20, default="#0066FF")
    order = models.IntegerField(default=0)
    is_featured = models.BooleanField(default=True)
    cta_link = models.CharField(max_length=200, blank=True)
    
    class Meta:
        db_table = 'cms_services'
        ordering = ['order']

class Testimonial(BaseModel):
    """Client testimonials"""
    name = models.CharField(max_length=100)
    title = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    content = models.TextField()
    rating = models.IntegerField(default=5)
    service_used = models.CharField(max_length=200)
    is_featured = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'cms_testimonials'
        ordering = ['order']
