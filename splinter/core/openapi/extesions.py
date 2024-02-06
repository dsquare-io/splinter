from drf_spectacular.extensions import OpenApiAuthenticationExtension


class UserAccessTokenAuthenticationScheme(OpenApiAuthenticationExtension):
    name = 'bearerAuth'
    target_class = 'splinter.authentication.UserAccessTokenAuthentication'

    def get_security_definition(self, auto_schema):
        return {
            'type': 'http',
            'scheme': 'bearer',
            'description': 'User access token',
            'bearerFormat': 'JWT',
        }
