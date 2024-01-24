REST_FRAMEWORK = {
    'NON_FIELD_ERRORS_KEY': '',
    'DEFAULT_RENDERER_CLASSES': ('splinter.core.renderers.CamelCaseJSONRenderer', ),
    'DEFAULT_PARSER_CLASSES': ('splinter.core.parsers.CamelCaseJSONParser', ),
    'DEFAULT_PAGINATION_CLASS': 'splinter.core.pagination.LimitOffsetPagination',
    'PAGE_SIZE': 100
}

SWAGGER_SETTINGS = {
    'USE_SESSION_AUTH': False,
    'DEFAULT_AUTO_SCHEMA_CLASS': 'splinter.ext.swagger.schema.SwaggerAutoSchema',
    'SECURITY_DEFINITIONS': {
        'Bearer': {
            'type': 'apiKey',
            'name': 'Authorization',
            'in': 'header'
        }
    }
}


def configure_drf(settings):
    if settings['DEBUG']:
        # Render API response as Browsable API Response in development environment
        REST_FRAMEWORK['DEFAULT_RENDERER_CLASSES'] += ('rest_framework.renderers.BrowsableAPIRenderer', )
