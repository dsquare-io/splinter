from django.db.models.signals import ModelSignal

pre_restore = ModelSignal(use_caching=True)
post_restore = ModelSignal(use_caching=True)
