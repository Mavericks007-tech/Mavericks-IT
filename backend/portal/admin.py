from django.contrib import admin

from .models import PortalToken


@admin.register(PortalToken)
class PortalTokenAdmin(admin.ModelAdmin):
    list_display = ('contact', 'label', 'is_revoked', 'expires_at', 'last_used_at', 'created_at')
    list_filter = ('is_revoked',)
    search_fields = ('contact__full_name', 'contact__email', 'label')
    autocomplete_fields = ('contact',)
    readonly_fields = ('token', 'last_used_at', 'created_at', 'updated_at')
