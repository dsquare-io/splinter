from django.conf import settings


def build_client():
    """Build an instructor client from settings, or None if parsing is disabled.

    ``settings.IMAGE_PARSER_MODEL`` is an ``instructor.from_provider`` spec, e.g.
    ``"ollama/gemma4:e4b"`` or ``"openai/gpt-4.1-mini"``. When unset the feature
    is disabled and callers should surface a 503.
    """
    model = settings.IMAGE_PARSER_MODEL
    if not model:
        return None

    import instructor

    kwargs = {}
    base_url = getattr(settings, 'IMAGE_PARSER_BASE_URL', None)
    if base_url:
        # For OpenAI-compatible providers (e.g. Ollama) this should include the
        # `/v1` suffix, e.g. http://host:11434/v1
        kwargs['base_url'] = base_url

    return instructor.from_provider(model, **kwargs)
