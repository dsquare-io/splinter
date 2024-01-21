TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
            'loaders': ['django.template.loaders.app_directories.Loader', ]
        },
    },
]


def configure_templates(settings):
    if not settings['DEBUG']:
        settings['TEMPLATES'][0]['OPTIONS']['loaders'] = [
            ('django.template.loaders.cached.Loader', settings['TEMPLATES'][0]['OPTIONS']['loaders'])
        ]
