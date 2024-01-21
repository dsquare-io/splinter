from .apps import *
from .auth import *
from .base import *
from .cache import *
from .celery import *
from .database import *
from .drf import *
from .email import *
from .host import *
from .logging import *
from .static import *
from .templates import *

# Delayed configuration
settings = locals()
for key in list(settings.keys()):
    if key.startswith('configure_'):
        settings[key](settings)
