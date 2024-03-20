SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'sessions'

CSRF_USE_SESSIONS = True

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

AUTHENTICATION_BACKENDS = ('splinter.apps.user.backend.AuthBackend',)

AUTHN_JTI_LENGTH = 8
AUTHN_REFRESH_TOKEN_ENABLED = True

OTP_TOTP_ISSUER = 'Splinter'
AUTH_USER_MODEL = 'user.User'
