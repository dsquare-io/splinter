import os

from splinter.utils.parser import parse_int

# `instructor.from_provider` spec, e.g. "ollama/gemma4:e4b" or "openai/gpt-4.1-mini".
# Unset -> the parsing feature is disabled (POST /api/parsing returns 503).
IMAGE_PARSER_MODEL = os.getenv('IMAGE_PARSER_MODEL') or None

# Optional base URL for OpenAI-compatible providers (e.g. a remote Ollama). For
# Ollama this must include the `/v1` suffix, e.g. http://host:11434/v1
IMAGE_PARSER_BASE_URL = os.getenv('IMAGE_PARSER_BASE_URL') or None

# In-call validation reask attempts handed to instructor's `max_retries`.
IMAGE_PARSER_MAX_RETRIES = parse_int(os.getenv('IMAGE_PARSER_MAX_RETRIES'), 2)
