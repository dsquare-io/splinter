import logging

from django.http import HttpResponse, HttpResponseServerError

from splinter.ext.health.checks import DatabaseHealthCheck

logger = logging.getLogger(__name__)

HEALTH_CHECKS = (DatabaseHealthCheck,)


def liveness(request):
    return HttpResponse('OK')


def readiness(request):
    try:
        for health_check in HEALTH_CHECKS:
            health_check()
    except Exception as e:
        logger.exception(e)
        return HttpResponseServerError('Unhealthy')

    return HttpResponse('OK')
