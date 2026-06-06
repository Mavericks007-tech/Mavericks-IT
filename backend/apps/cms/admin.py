from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from apps.core.models import BaseModel

class HeroSection(BaseModel):
    """Hero section content - singleton"""
    headline = models.CharField(max_length=200, default="Bangladesh's Most Trusted Technology Partner")
    subheadline = models.TextField(
        default="We design, develop, and deploy world-class software, websites, "
                "and digital solutions for ambitious businesses — from neighborhood "
                "shops to multinational corporations."
    )
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

class TrustStat(BaseModel):
    """Trust bar statistics (animated counters)"""
    label = models.CharField(max_length=100)
    value = models.CharField(max_length=50)
    numeric_value = models.IntegerField()
    suffix = models.CharField(max_length=20, blank=True)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'cms_trust_stats'
        ordering = ['order']

class Service(BaseModel):
    """Service cards displayed on homepage"""
    title = models.CharField(max_length=100)
    subtitle = models.CharField(max_length=200)
    simple_explanation = models.TextField()
    icon_name = models.CharField(max_length=50, help_text="Lucide icon name")
    gradient_from = models.CharField(max_length=20, default="#00D9FF")
    gradient_to = models.CharField(max_length=20, default="#0066FF")
    order = models.IntegerField(default=0)
    is_featured = models.BooleanField(default=True)
    cta_link = models.CharField(max_length=200, blank=True)
    
    class Meta:
        db_table = 'cms_services'
        ordering = ['order']

class Industry(BaseModel):
    """Industry served section"""
    name = models.CharField(max_length=100)
    icon_name = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    example_service = models.CharField(max_length=200, blank=True)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'cms_industries'
        ordering = ['order']

class CaseStudy(BaseModel):
    """Featured case study"""
    title = models.CharField(max_length=200)
    client_name = models.CharField(max_length=200)
    industry = models.CharField(max_length=100)
    metric = models.CharField(max_length=100)
    metric_description = models.CharField(max_length=200)
    description = models.TextField()
    challenge = models.TextField()
    solution = models.TextField()
    results = models.JSONField(default=list)
    image_url = models.CharField(max_length=500)
    logo_url = models.CharField(max_length=500, blank=True)
    testimonial_quote = models.TextField()
    testimonial_author = models.CharField(max_length=200)
    testimonial_title = models.CharField(max_length=200)
    technologies = models.JSONField(default=list)
    is_featured = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'cms_case_studies'
        ordering = ['order']

class Differentiator(BaseModel):
    """Why choose us section"""
    title = models.CharField(max_length=100)
    description = models.TextField()
    icon_name = models.CharField(max_length=50)
    order = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'cms_differentiators'
        ordering = ['order']

class ProcessStep(BaseModel):
    """Process section steps"""
    step_number = models.IntegerField()
    title = models.CharField(max_length=100)
    description = models.TextField()
    duration = models.CharField(max_length=50)
    icon_name = models.CharField(max_length=50)
    order = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'cms_process_steps'
        ordering = ['step_number']

class Testimonial(BaseModel):
    """Client testimonials"""
    name = models.CharField(max_length=100)
    title = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    content = models.TextField()
    rating = models.IntegerField(default=5)
    avatar_url = models.CharField(max_length=500, blank=True)
    video_url = models.CharField(max_length=500, blank=True)
    service_used = models.CharField(max_length=200)
    is_featured = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'cms_testimonials'
        ordering = ['order']

class BlogPost(BaseModel):
    """Blog posts for insights section"""
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    excerpt = models.TextField()
    content = models.TextField()
    featured_image = models.CharField(max_length=500)
    author = models.CharField(max_length=100)
    author_avatar = models.CharField(max_length=500, blank=True)
    read_time = models.IntegerField(help_text="Minutes to read")
    category = models.CharField(max_length=100)
    tags = models.JSONField(default=list)
    views = models.IntegerField(default=0)
    is_published = models.BooleanField(default=False)
    published_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'cms_blog_posts'
        ordering = ['-published_at']

class CTASection(BaseModel):
    """Final CTA section - singleton"""
    headline = models.CharField(max_length=200, default="Ready To Build Something Extraordinary?")
    subtext = models.CharField(max_length=300, default="Let's discuss your project. Free 30-minute strategy call. No commitment. No pressure.")
    primary_cta_text = models.CharField(max_length=50, default="Schedule Your Free Consultation")
    primary_cta_link = models.CharField(max_length=200, default="/contact")
    secondary_cta_text = models.CharField(max_length=50, default="Call Now")
    secondary_cta_link = models.CharField(max_length=200, default="tel:+8801XXXXXXXXX")
    background_gradient_start = models.CharField(max_length=20, default="#0066FF")
    background_gradient_end = models.CharField(max_length=20, default="#00D9FF")
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'cms_cta_section'
    
    def save(self, *args, **kwargs):
        if not self.pk and CTASection.objects.exists():
            raise ValidationError("Only one CTASection can exist")
        super().save(*args, **kwargs)