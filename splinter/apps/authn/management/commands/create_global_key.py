import logging

from django.core.management.base import BaseCommand, CommandError

from splinter.apps.authn.models import GlobalKey

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Create a versioned global signing key for access or refresh tokens'

    def add_arguments(self, parser):
        parser.add_argument('key_type', choices=[GlobalKey.KEY_TYPE_ACCESS, GlobalKey.KEY_TYPE_REFRESH])
        parser.add_argument('version', type=int)

    def handle(self, *args, **options):
        key_type = options['key_type']
        version = options['version']

        if GlobalKey.objects.filter(key_type=key_type, version=version).exists():
            raise CommandError(f'{key_type} key v{version} already exists')

        GlobalKey.objects.create(key_type=key_type, version=version)
        logger.info(f'Created {key_type} key v{version}')
