from splinter import __description__, __version__

REST_FRAMEWORK = {
    'NON_FIELD_ERRORS_KEY': '',
    'DEFAULT_RENDERER_CLASSES': ('splinter.core.renderers.CamelCaseJSONRenderer',),
    'DEFAULT_PARSER_CLASSES': ('splinter.core.parsers.CamelCaseJSONParser',),
    'DEFAULT_PAGINATION_CLASS': 'splinter.core.pagination.LimitOffsetPagination',
    'PAGE_SIZE': 100,
    'DEFAULT_SCHEMA_CLASS': 'splinter.core.openapi.schema.AutoSchema',
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'Splinter API',
    'DESCRIPTION': __description__,
    'VERSION': __version__,
    'SCHEMA_PATH_PREFIX': '/api/',
    'SERVE_INCLUDE_SCHEMA': False,
}


def configure_drf(settings):
    if settings['DEBUG']:
        # Render API response as Browsable API Response in development environment
        REST_FRAMEWORK['DEFAULT_RENDERER_CLASSES'] += ('rest_framework.renderers.BrowsableAPIRenderer',)
