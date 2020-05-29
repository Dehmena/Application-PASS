from apscheduler.triggers.cron import CronTrigger

from application.extensions import quote_reminder_scheduler, quote_cancellation_scheduler, backup_scheduler
from application.utils.tools import get_config_dict
from application.utils.scheduler.quote_cancellation import quote_cancellation
from application.utils.scheduler.quote_reminder import quote_reminder
from application.utils.scheduler.backup_data import backup_data

import atexit


def init_schedule():
    config = get_config_dict()
    is_quote_reminder_working = config['other_parameters']['is_quote_reminder_working']
    is_quote_cancellation_working = config['other_parameters']['is_quote_cancellation_working']

    cron_trigger_cancellation = CronTrigger(hour=7, minute=30, second=0)
    cron_trigger_reminder = CronTrigger(hour=8, minute=00, second=0)
    cron_trigger_backup = CronTrigger(day=1, hour=8, minute=15, second=0)

    quote_cancellation_scheduler.add_job(func=quote_cancellation, trigger=cron_trigger_cancellation)
    quote_reminder_scheduler.add_job(func=quote_reminder, trigger=cron_trigger_reminder)
    backup_scheduler.add_job(func=backup_data, trigger=cron_trigger_backup)

    quote_cancellation_scheduler.start()
    quote_reminder_scheduler.start()
    backup_scheduler.start()

    if not is_quote_reminder_working:
        quote_reminder_scheduler.pause()

    if not is_quote_cancellation_working:
        quote_cancellation_scheduler.pause()

    atexit.register(lambda: quote_reminder_scheduler.shutdown())
    atexit.register(lambda: quote_cancellation_scheduler.shutdown())
    atexit.register(lambda: backup_scheduler.shutdown())
