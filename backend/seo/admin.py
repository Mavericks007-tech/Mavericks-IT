from django.contrib import admin
from simple_history.admin import SimpleHistoryAdmin

from .models import MetaTag, SchemaOrg


@admin.register(MetaTag)
class MetaTagAdmin(SimpleHistoryAdmin):
    list_display = ('path', 'title', 'robots', 'updated_at')
    list_filter = ('robots',)
    search_fields = ('path', 'title', 'description')
    fieldsets = (
        ('Path', {'fields': ('path', 'canonical_url')}),
        ('Basic Meta', {'fields': ('title', 'description', 'robots')}),
        ('Keywords', {'fields': ('primary_keywords', 'secondary_keywords')}),
        ('Open Graph', {'fields': ('og_title', 'og_description', 'og_image', 'og_type')}),
        ('Twitter', {'fields': ('twitter_card', 'twitter_title', 'twitter_description', 'twitter_image')}),
    )


@admin.register(SchemaOrg)
class SchemaOrgAdmin(SimpleHistoryAdmin):
    list_display = ('path', 'schema_type', 'is_active', 'order', 'updated_at')
    list_filter = ('schema_type', 'is_active')
    search_fields = ('path',)
    list_editable = ('is_active', 'order')
