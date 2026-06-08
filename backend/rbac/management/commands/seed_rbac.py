from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.core.management.base import BaseCommand
from django.db import transaction

from rbac.groups import ROLE_MATRIX


class Command(BaseCommand):
    help = "Seed Django Groups + Permissions for 9 staff roles."

    @transaction.atomic
    def handle(self, *args, **options):
        total_perms = 0
        for role, mapping in ROLE_MATRIX.items():
            group, _ = Group.objects.get_or_create(name=role)
            perms = []
            for model_key, actions in mapping.items():
                app_label, model_name = model_key.split('.')
                try:
                    ct = ContentType.objects.get(app_label=app_label, model=model_name)
                except ContentType.DoesNotExist:
                    self.stdout.write(self.style.WARNING(f"Missing model: {model_key}"))
                    continue
                for action in actions:
                    codename = f"{action}_{model_name}"
                    try:
                        perms.append(Permission.objects.get(content_type=ct, codename=codename))
                    except Permission.DoesNotExist:
                        self.stdout.write(self.style.WARNING(f"Missing perm: {codename}"))
            group.permissions.set(perms)
            total_perms += len(perms)
            self.stdout.write(f"  {role}: {len(perms)} perms")
        self.stdout.write(self.style.SUCCESS(
            f"RBAC seeded: {Group.objects.count()} groups, {total_perms} total perm assignments."
        ))
