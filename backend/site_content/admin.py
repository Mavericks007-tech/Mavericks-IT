from django.contrib import admin
from simple_history.admin import SimpleHistoryAdmin

from .models import (
    SiteSettings, NavMenu, NavItem,
    FooterColumn, FooterLink,
    MediaAsset, Page, Redirect,
)


@admin.register(SiteSettings)
class SiteSettingsAdmin(SimpleHistoryAdmin):
    list_display = ('site_name', 'tagline', 'contact_email', 'contact_phone', 'updated_at')
    fieldsets = (
        ('Identity', {'fields': ('site_name', 'tagline', 'logo', 'favicon')}),
        ('Contact', {'fields': ('contact_email', 'contact_phone', 'whatsapp_number', 'office_address', 'office_hours')}),
        ('Social', {'fields': ('linkedin_url', 'facebook_url', 'instagram_url', 'youtube_url', 'twitter_url')}),
        ('Analytics', {'fields': ('google_analytics_id', 'google_tag_manager_id', 'facebook_pixel_id')}),
        ('Business', {'fields': ('default_currency', 'vat_percent')}),
    )

    def has_add_permission(self, request):
        return not SiteSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


class NavItemInline(admin.TabularInline):
    model = NavItem
    extra = 0
    fields = ('label', 'url', 'parent', 'icon_name', 'order', 'open_in_new_tab', 'is_active')


@admin.register(NavMenu)
class NavMenuAdmin(SimpleHistoryAdmin):
    list_display = ('name', 'location', 'is_active', 'updated_at')
    list_filter = ('location', 'is_active')
    search_fields = ('name',)
    inlines = [NavItemInline]


@admin.register(NavItem)
class NavItemAdmin(SimpleHistoryAdmin):
    list_display = ('label', 'menu', 'parent', 'url', 'order', 'is_active')
    list_filter = ('menu__location', 'is_active')
    search_fields = ('label', 'url')
    list_editable = ('order', 'is_active')
    autocomplete_fields = ('menu', 'parent')


class FooterLinkInline(admin.TabularInline):
    model = FooterLink
    extra = 0
    fields = ('label', 'url', 'order', 'open_in_new_tab', 'is_active')


@admin.register(FooterColumn)
class FooterColumnAdmin(SimpleHistoryAdmin):
    list_display = ('heading', 'order', 'is_active', 'updated_at')
    list_filter = ('is_active',)
    search_fields = ('heading',)
    list_editable = ('order', 'is_active')
    inlines = [FooterLinkInline]


@admin.register(FooterLink)
class FooterLinkAdmin(SimpleHistoryAdmin):
    list_display = ('label', 'column', 'url', 'order', 'is_active')
    list_filter = ('column', 'is_active')
    search_fields = ('label', 'url')


@admin.register(MediaAsset)
class MediaAssetAdmin(SimpleHistoryAdmin):
    list_display = ('title', 'media_type', 'preview', 'size_display', 'mime_type', 'updated_at')
    list_filter = ('media_type',)
    search_fields = ('title', 'alt_text', 'caption')
    readonly_fields = ('file_size', 'width', 'height', 'mime_type', 'preview_large', 'created_at', 'updated_at')
    fieldsets = (
        ('File', {
            'fields': ('title', 'file', 'media_type', 'preview_large'),
            'description': 'Upload images, videos, or documents. To replace, upload a new file and save.',
        }),
        ('Metadata', {'fields': ('alt_text', 'caption', 'tags')}),
        ('Auto-detected', {'fields': ('file_size', 'width', 'height', 'mime_type'), 'classes': ('collapse',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )

    @admin.display(description='Preview')
    def preview(self, obj):
        from django.utils.html import format_html
        if not obj.file:
            return '—'
        if obj.media_type == 'image':
            return format_html('<img src="{}" style="max-height:40px;border-radius:4px;" />', obj.file.url)
        if obj.media_type == 'video':
            return format_html('🎥 {}', obj.file.name.rsplit('/', 1)[-1])
        return format_html('📄 {}', obj.file.name.rsplit('/', 1)[-1])

    @admin.display(description='Preview')
    def preview_large(self, obj):
        from django.utils.html import format_html
        if not obj.file:
            return '—'
        if obj.media_type == 'image':
            return format_html('<img src="{}" style="max-width:400px;border-radius:8px;" />', obj.file.url)
        if obj.media_type == 'video':
            return format_html(
                '<video controls style="max-width:400px;border-radius:8px;"><source src="{}" type="{}"></video>',
                obj.file.url, obj.mime_type or 'video/mp4',
            )
        return format_html('<a href="{}" target="_blank">Open file →</a>', obj.file.url)


@admin.register(Page)
class PageAdmin(SimpleHistoryAdmin):
    list_display = ('title', 'slug', 'status', 'show_in_sitemap', 'order', 'updated_at')
    list_filter = ('status', 'show_in_sitemap')
    search_fields = ('title', 'slug', 'body')
    prepopulated_fields = {'slug': ('title',)}
    list_editable = ('status', 'order')
    autocomplete_fields = ('featured_image',)
    fieldsets = (
        (None, {'fields': ('title', 'slug', 'status', 'order')}),
        ('Content', {'fields': ('body', 'featured_image')}),
        ('SEO', {'fields': ('show_in_sitemap',)}),
    )


@admin.register(Redirect)
class RedirectAdmin(SimpleHistoryAdmin):
    list_display = ('from_path', 'to_path', 'status_code', 'is_active', 'hit_count')
    list_filter = ('status_code', 'is_active')
    search_fields = ('from_path', 'to_path')
    list_editable = ('is_active',)
    readonly_fields = ('hit_count',)
