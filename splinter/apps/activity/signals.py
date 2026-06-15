from django.dispatch import Signal

# Fired after an activity is logged and its audience created.
# Provides: activity (Activity instance), notify_user_ids (list[int]) — audience minus actor.
activity_logged = Signal()
