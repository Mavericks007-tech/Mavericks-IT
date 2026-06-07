from django.core.exceptions import ValidationError
from django.db import models
from simple_history.models import HistoricalRecords

from core.models import BaseModel


class SiteSettings(BaseModel):
    """Global site configuration — singleton."""
    site_name = models.CharField(max_length=100, default="Mavericks Tech Bangladesh")
    tagline = models.CharField(max_length=200, default="Bangladesh's Most Trusted Technology Partner")
    logo = models.ImageField(upload_to='site/', blank=True, null=True)
    favicon = models.ImageField(upload_to='site/', blank=True, null=True)
    contact_email = models.EmailField(default="hello@maverickstech.com.bd")
    contact_phone = models.CharField(max_length=30, default="+880 1XXX XXX XXX")
    whatsapp_number = models.CharField(max_length=30, blank=True)
    office_address = models.TextField(blank=True)
    office_hours = models.CharField(max_length=200, blank=True, default="Sun-Thu, 9 AM - 6 PM")
    linkedin_url = models.URLField(blank=True)
    facebook_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    youtube_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    google_analytics_id = models.CharField(max_length=50, blank=True)
    google_tag_manager_id = models.CharField(max_length=50, blank=True)
    facebook_pixel_id = models.CharField(max_length=50, blank=True)
    default_currency = models.CharField(max_length=10, default="BDT")
    vat_percent = models.DecimalField(max_digits=5, decimal_places=2, default=15.00)
    history = HistoricalRecords()

    class Meta:
        db_table = 'site_settings'
        verbose_name_plural = 'Site Settings'

    def __str__(self):
        return self.site_name

    def save(self, *args, **kwargs):
        if not self.pk and SiteSettings.objects.exists():
            raise ValidationError("Only one SiteSettings instance allowed.")
        super().save(*args, **kwargs)


class NavMenu(BaseModel):
    """Header or footer nav container."""
    LOCATION_CHOICES = [
        ('header', 'Header'),
        ('footer', 'Footer'),
        ('mobile', 'Mobile'),
    ]
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=20, choices=LOCATION_CHOICES, unique=True)
    is_active = models.BooleanField(default=True)
    history = HistoricalRecords()

    class Meta:
        db_table = 'nav_menu'

    def __str__(self):
        return f"{self.name} ({self.location})"


class NavItem(BaseModel):
    """Nav link, supports one level of nesting via parent."""
    menu = models.ForeignKey(NavMenu, on_delete=models.CASCADE, related_name='items')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    label = models.CharField(max_length=100)
    url = models.CharField(max_length=300, help_text="Relative path (/about) or full URL")
    open_in_new_tab = models.BooleanField(default=False)
    icon_name = models.CharField(max_length=50, blank=True)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    history = HistoricalRecords()

    class Meta:
        db_table = 'nav_item'
        ordering = ['order']

    def __str__(self):
        return self.label


class FooterColumn(BaseModel):
    """Footer column heading (Company, Services, Industries, etc)."""
    heading = models.CharField(max_length=100)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    history = HistoricalRecords()

    class Meta:
        db_table = 'footer_column'
        ordering = ['order']

    def __str__(self):
        return self.heading


class FooterLink(BaseModel):
    """Link inside a FooterColumn."""
    column = models.ForeignKey(FooterColumn, on_delete=models.CASCADE, related_name='links')
    label = models.CharField(max_length=100)
    url = models.CharField(max_length=300)
    open_in_new_tab = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    history = HistoricalRecords()

    class Meta:
        db_table = 'footer_link'
        ordering = ['order']

    def __str__(self):
        return f"{self.column.heading} → {self.label}"


class MediaAsset(BaseModel):
    """Image/file library reusable across content."""
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to='media/')
    alt_text = models.CharField(max_length=300, blank=True)
    caption = models.CharField(max_length=300, blank=True)
    tags = models.JSONField(default=list, blank=True)
    history = HistoricalRecords()

    class Meta:
        db_table = 'media_asset'
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class Page(BaseModel):
    """Generic editable page (About, Contact body, Privacy, Terms, Page 02-50)."""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    body = models.TextField(blank=True, help_text="Markdown or HTML")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    featured_image = models.ForeignKey(
        MediaAsset, on_delete=models.SET_NULL, null=True, blank=True, related_name='pages'
    )
    show_in_sitemap = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    history = HistoricalRecords()

    class Meta:
        db_table = 'page'
        ordering = ['order', 'title']

    def __str__(self):
        return self.title


class Redirect(BaseModel):
    """301/302 management."""
    STATUS_CHOICES = [(301, '301 Permanent'), (302, '302 Temporary')]
    from_path = models.CharField(max_length=500, unique=True, help_text="e.g. /old-url")
    to_path = models.CharField(max_length=500, help_text="e.g. /new-url or https://...")
    status_code = models.IntegerField(choices=STATUS_CHOICES, default=301)
    is_active = models.BooleanField(default=True)
    hit_count = models.IntegerField(default=0)
    history = HistoricalRecords()

    class Meta:
        db_table = 'redirect'

    def __str__(self):
        return f"{self.from_path} → {self.to_path} ({self.status_code})"
