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
    list_display = ('title', 'file', 'alt_text', 'created_at')
    search_fields = ('title', 'alt_text', 'caption')
    readonly_fields = ('created_at', 'updated_at')


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
