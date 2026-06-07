from rest_framework import serializers

from .models import EmailCampaign, EmailLog, EmailTemplate


class EmailTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailTemplate
        fields = [
            'id', 'key', 'name', 'category', 'subject',
            'body_html', 'body_text', 'is_active',
            'description', 'available_vars',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class EmailLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailLog
        fields = [
            'id', 'template', 'to_email', 'to_name', 'from_email', 'from_name',
            'cc', 'bcc', 'reply_to', 'subject', 'body_html', 'body_text',
            'status', 'error_message',
            'sent_at', 'opened_at', 'clicked_at', 'open_count',
            'lead', 'client', 'contact', 'project', 'quote', 'invoice',
            'sent_by', 'created_at',
        ]
        read_only_fields = fields


class EmailSendSerializer(serializers.Serializer):
    template_key = serializers.SlugField()
    to_email = serializers.EmailField()
    to_name = serializers.CharField(required=False, allow_blank=True)
    context = serializers.DictField(required=False)
    cc = serializers.ListField(child=serializers.EmailField(), required=False)
    bcc = serializers.ListField(child=serializers.EmailField(), required=False)
    related = serializers.DictField(required=False, help_text="e.g. {lead: id, invoice: id}")


class EmailCampaignSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailCampaign
        fields = [
            'id', 'name', 'template', 'status',
            'scheduled_at', 'started_at', 'completed_at',
            'target_leads', 'target_clients',
            'sent_count', 'failed_count',
            'created_by', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'started_at', 'completed_at', 'sent_count', 'failed_count', 'created_at', 'updated_at']
