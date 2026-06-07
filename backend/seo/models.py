from django.db import models
from simple_history.models import HistoricalRecords

from core.models import BaseModel


class MetaTag(BaseModel):
    """SEO meta per page path."""
    ROBOTS_CHOICES = [
        ('index,follow', 'Index, Follow'),
        ('noindex,follow', 'NoIndex, Follow'),
        ('index,nofollow', 'Index, NoFollow'),
        ('noindex,nofollow', 'NoIndex, NoFollow'),
    ]
    path = models.CharField(
        max_length=300, unique=True,
        help_text="URL path this meta applies to. Use / for homepage, /about, /services/seo, etc.",
    )
    title = models.CharField(max_length=70, help_text="Max 60 chars recommended for Google")
    description = models.CharField(max_length=200, help_text="Max 155 chars recommended")
    canonical_url = models.URLField(blank=True)
    robots = models.CharField(max_length=30, choices=ROBOTS_CHOICES, default='index,follow')
    og_title = models.CharField(max_length=100, blank=True)
    og_description = models.CharField(max_length=300, blank=True)
    og_image = models.ImageField(upload_to='seo/og/', blank=True, null=True)
    og_type = models.CharField(max_length=30, default='website')
    twitter_card = models.CharField(max_length=30, default='summary_large_image')
    twitter_title = models.CharField(max_length=100, blank=True)
    twitter_description = models.CharField(max_length=300, blank=True)
    twitter_image = models.ImageField(upload_to='seo/twitter/', blank=True, null=True)
    primary_keywords = models.JSONField(default=list, blank=True)
    secondary_keywords = models.JSONField(default=list, blank=True)
    history = HistoricalRecords()

    class Meta:
        db_table = 'meta_tag'
        ordering = ['path']

    def __str__(self):
        return f"{self.path} — {self.title[:40]}"


class SchemaOrg(BaseModel):
    """JSON-LD structured data per page path."""
    SCHEMA_TYPE_CHOICES = [
        ('Organization', 'Organization'),
        ('LocalBusiness', 'LocalBusiness'),
        ('WebSite', 'WebSite'),
        ('WebPage', 'WebPage'),
        ('Article', 'Article'),
        ('BlogPosting', 'BlogPosting'),
        ('Service', 'Service'),
        ('Product', 'Product'),
        ('FAQPage', 'FAQPage'),
        ('BreadcrumbList', 'BreadcrumbList'),
        ('Person', 'Person'),
        ('Review', 'Review'),
        ('AggregateRating', 'AggregateRating'),
    ]
    path = models.CharField(max_length=300, help_text="URL path this schema applies to")
    schema_type = models.CharField(max_length=50, choices=SCHEMA_TYPE_CHOICES)
    data = models.JSONField(help_text="Full JSON-LD block (without @context)")
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    history = HistoricalRecords()

    class Meta:
        db_table = 'schema_org'
        ordering = ['path', 'order']
        indexes = [models.Index(fields=['path'])]

    def __str__(self):
        return f"{self.path} — {self.schema_type}"
