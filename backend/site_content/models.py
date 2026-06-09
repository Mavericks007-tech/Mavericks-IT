from django.core.exceptions import ValidationError
from django.db import models
from django_ckeditor_5.fields import CKEditor5Field
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
    google_analytics_id = models.CharField(max_length=50, blank=True, help_text="GA4 measurement ID, e.g. G-XXXXXXX")
    google_tag_manager_id = models.CharField(max_length=50, blank=True, help_text="GTM container ID, e.g. GTM-XXXXX")
    facebook_pixel_id = models.CharField(max_length=50, blank=True)
    gsc_verification = models.CharField(
        max_length=200, blank=True,
        help_text="Google Search Console site-verification token (content value only)",
    )
    bing_verification = models.CharField(max_length=200, blank=True)
    og_default_image = models.ImageField(
        upload_to='site/', blank=True, null=True,
        help_text="Fallback OG/Twitter share image (1200x630 jpg). Used when a page has no og_image.",
    )
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
    """Image / video / file library. Admin uploads + replaces freely.
    Bytes live on disk under MEDIA_ROOT; DB stores path + metadata.
    No artificial size cap — only disk space limits."""

    MEDIA_TYPE_CHOICES = [
        ('image', 'Image'),
        ('video', 'Video'),
        ('document', 'Document'),
        ('audio', 'Audio'),
        ('other', 'Other'),
    ]

    title = models.CharField(max_length=200)
    file = models.FileField(
        upload_to='media/%Y/%m/',
        help_text="Images, videos (mp4/webm), documents — no size limit. "
                  "Replace anytime by uploading a new file here.",
    )
    media_type = models.CharField(max_length=20, choices=MEDIA_TYPE_CHOICES, default='image')
    alt_text = models.CharField(max_length=300, blank=True,
                                help_text="Required for images (SEO + accessibility)")
    caption = models.CharField(max_length=300, blank=True)
    tags = models.JSONField(default=list, blank=True)

    # Auto-populated metadata
    file_size = models.BigIntegerField(default=0, help_text="Bytes")
    width = models.IntegerField(null=True, blank=True, help_text="Pixels (images/videos)")
    height = models.IntegerField(null=True, blank=True)
    mime_type = models.CharField(max_length=100, blank=True)

    history = HistoricalRecords()

    class Meta:
        db_table = 'media_asset'
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if self.file and hasattr(self.file, 'file'):
            try:
                self.file_size = self.file.size
            except Exception:
                pass
            # Auto-detect media_type from extension
            name = self.file.name.lower()
            if name.endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif')):
                self.media_type = 'image'
            elif name.endswith(('.mp4', '.webm', '.mov', '.avi', '.mkv')):
                self.media_type = 'video'
            elif name.endswith(('.mp3', '.wav', '.ogg', '.m4a')):
                self.media_type = 'audio'
            elif name.endswith(('.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx')):
                self.media_type = 'document'
            # Auto-detect mime
            import mimetypes
            guessed, _ = mimetypes.guess_type(name)
            if guessed:
                self.mime_type = guessed
        super().save(*args, **kwargs)

    @property
    def size_display(self):
        """Human-readable size."""
        size = self.file_size or 0
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024:
                return f"{size:.1f} {unit}"
            size /= 1024
        return f"{size:.1f} TB"


class Page(BaseModel):
    """Generic editable page (About, Contact body, Privacy, Terms, Page 02-50)."""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    body = CKEditor5Field(config_name='extends', blank=True, help_text="Rich-text editor — paste HTML or use toolbar")
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
