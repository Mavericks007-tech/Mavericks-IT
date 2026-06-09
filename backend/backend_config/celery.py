import os

from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_config.settings')

app = Celery('mavericks')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()


app.conf.beat_schedule = {
    'send-payment-reminders-daily': {
        'task': 'crm.tasks.send_payment_reminders',
        'schedule': crontab(hour=9, minute=0),
    },
    'weekly-client-digest': {
        'task': 'comms.tasks.send_weekly_client_digest',
        'schedule': crontab(hour=8, minute=0, day_of_week='monday'),
    },
    'abandoned-quote-followup': {
        'task': 'crm.tasks.followup_abandoned_quotes',
        'schedule': crontab(hour=10, minute=30),
    },
    'database-backup-daily': {
        'task': 'core.tasks.pg_dump_to_s3',
        'schedule': crontab(hour=2, minute=0),
    },
}


@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
