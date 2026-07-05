"""Push every local MediaAsset file up to Cloudinary and mark the row as provider='cloudinary'.

Idempotent — rows already flagged cloudinary are skipped.
Requires USE_CLOUDINARY=True and CLOUDINARY_* creds set.

    python manage.py migrate_media_to_cloudinary
    python manage.py migrate_media_to_cloudinary --dry-run
    python manage.py migrate_media_to_cloudinary --limit 50
"""
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand, CommandError

from site_content.models import MediaAsset


class Command(BaseCommand):
    help = "Upload all local/S3 MediaAsset files to Cloudinary and update DB rows."

    def add_arguments(self, parser):
        parser.add_argument('--dry-run', action='store_true', help="Report what would move without uploading.")
        parser.add_argument('--limit', type=int, default=0, help="Cap number of rows processed (0 = no cap).")
        parser.add_argument('--force', action='store_true',
                            help="Re-upload rows already marked provider='cloudinary'.")

    def handle(self, *args, **opts):
        if not getattr(settings, 'USE_CLOUDINARY', False):
            raise CommandError("USE_CLOUDINARY is False. Enable it in .env before running.")
        try:
            import cloudinary
            import cloudinary.uploader
        except ImportError as e:
            raise CommandError(f"cloudinary package missing: {e}. pip install cloudinary")

        cfg = settings.CLOUDINARY_STORAGE
        cloudinary.config(
            cloud_name=cfg['CLOUD_NAME'],
            api_key=cfg['API_KEY'],
            api_secret=cfg['API_SECRET'],
            secure=True,
        )
        folder = getattr(settings, 'CLOUDINARY_FOLDER', 'mavericks')

        qs = MediaAsset.objects.all().order_by('id')
        if not opts['force']:
            qs = qs.exclude(provider='cloudinary')
        if opts['limit']:
            qs = qs[:opts['limit']]

        total = qs.count()
        self.stdout.write(f"Found {total} MediaAsset row(s) to migrate.")

        moved = skipped = failed = 0
        for asset in qs:
            if not asset.file:
                skipped += 1
                self.stdout.write(f"  · #{asset.id} '{asset.title}' — no file, skip")
                continue

            filename = asset.file.name.rsplit('/', 1)[-1]
            target_folder = f"{folder}/{asset.media_type}"
            self.stdout.write(f"  → #{asset.id} '{asset.title}' ({filename}) → {target_folder}/")

            if opts['dry_run']:
                moved += 1
                continue

            try:
                # Read bytes from the current backend (local FS or S3).
                asset.file.open('rb')
                data = asset.file.read()
                asset.file.close()

                resource_type = 'video' if asset.media_type == 'video' else ('image' if asset.media_type == 'image' else 'raw')
                result = cloudinary.uploader.upload(
                    data,
                    folder=target_folder,
                    resource_type=resource_type,
                    overwrite=True,
                    use_filename=True,
                    unique_filename=False,
                )
                public_id = result.get('public_id', '')
                secure_url = result.get('secure_url', '')
                width = result.get('width')
                height = result.get('height')

                # Re-save the file via Cloudinary storage so DEFAULT_FILE_STORAGE writes the new path.
                asset.file.save(filename, ContentFile(data), save=False)
                asset.provider = 'cloudinary'
                asset.public_id = public_id
                asset.cdn_url = secure_url
                if width:
                    asset.width = width
                if height:
                    asset.height = height
                asset.save(update_fields=['file', 'provider', 'public_id', 'cdn_url', 'width', 'height'])
                moved += 1
            except Exception as e:
                failed += 1
                self.stderr.write(f"    ! failed: {e}")

        self.stdout.write(self.style.SUCCESS(
            f"Done. moved={moved} skipped={skipped} failed={failed} (dry_run={opts['dry_run']})"
        ))
