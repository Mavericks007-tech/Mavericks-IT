import uuid

from django.db import models


class BaseModel(models.Model):
    """Abstract base model with common fields"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)

    class Meta:
        abstract = True

    def soft_delete(self):
        """Soft delete instead of actual deletion"""
        self.is_deleted = True
        self.save()

    def restore(self):
        """Restore a soft-deleted record"""
        self.is_deleted = False
        self.save()
