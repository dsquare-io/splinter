REST_FRAMEWORK = {
    'NON_FIELD_ERRORS_KEY': 'request',
    'DEFAULT_RENDERER_CLASSES': ('splinter.core.renderers.CamelCaseJSONRenderer', ),
    'DEFAULT_PARSER_CLASSES': ('splinter.core.parsers.CamelCaseJSONParser', ),
    'DEFAULT_PAGINATION_CLASS': 'splinter.core.pagination.LimitOffsetPagination',
    'PAGE_SIZE': 25
}


def configure_drf(settings):
    if settings['DEBUG']:
        # Render API response as Browsable API Response in development environment
        REST_FRAMEWORK['DEFAULT_RENDERER_CLASSES'] += ('rest_framework.renderers.BrowsableAPIRenderer', )
