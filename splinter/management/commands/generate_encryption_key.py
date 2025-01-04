import hashlib

from cryptography.fernet import Fernet
from django.core.management import BaseCommand


class Command(BaseCommand):
    def handle(self, *args, **options):
        encryption_key = Fernet.generate_key().decode('utf8')
        key_hash = hashlib.sha1(encryption_key.encode('utf8')).hexdigest()[:8].upper()

        print('Key hash:', key_hash)
        print('Encryption key:', encryption_key)
        print('')
        print('Add the following to your .env file:')
        print(f'ENCRYPTION_KEY_{key_hash}={encryption_key}')
