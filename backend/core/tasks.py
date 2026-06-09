"""Core Celery tasks — backup, housekeeping."""
import logging
import subprocess
from datetime import datetime
from pathlib import Path

from celery import shared_task
from django.conf import settings

log = logging.getLogger(__name__)


@shared_task(name='core.tasks.pg_dump_to_s3')
def pg_dump_to_s3():
    """Dump Postgres to /backups, optionally push to S3 if AWS creds present."""
    db = settings.DATABASES['default']
    if 'postgresql' not in db['ENGINE']:
        log.info('pg_dump skipped: not postgres')
        return

    backup_dir = Path(settings.BASE_DIR) / 'backups'
    backup_dir.mkdir(exist_ok=True)
    stamp = datetime.utcnow().strftime('%Y%m%d-%H%M%S')
    out = backup_dir / f"{db['NAME']}-{stamp}.sql.gz"

    cmd = (
        f"PGPASSWORD='{db['PASSWORD']}' pg_dump -h {db['HOST']} -p {db['PORT']} "
        f"-U {db['USER']} {db['NAME']} | gzip > {out}"
    )
    subprocess.run(cmd, shell=True, check=True)
    log.info('pg_dump wrote %s', out)

    if getattr(settings, 'USE_S3', False):
        import boto3
        s3 = boto3.client('s3')
        key = f"db-backups/{out.name}"
        s3.upload_file(str(out), settings.AWS_STORAGE_BUCKET_NAME, key)
        log.info('pg_dump uploaded s3://%s/%s', settings.AWS_STORAGE_BUCKET_NAME, key)
        out.unlink()

    return str(out)
