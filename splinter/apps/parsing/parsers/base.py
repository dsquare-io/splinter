import base64

from django.conf import settings
from pydantic import BaseModel

from splinter.apps.parsing.exceptions import ParseError, ParseTransientError


class ImageParser:
    """Base parser: an instructor client + a result model + a prompt.

    Subclasses set ``result_model`` and ``prompt``. ``parse`` runs structured
    extraction over the given image bytes.
    """

    result_model: type[BaseModel]
    prompt: str

    def __init__(self, client):
        self.client = client

    def parse(self, image: bytes, mime: str) -> BaseModel:
        from instructor.processing.multimodal import Image

        b64 = base64.b64encode(image).decode()
        img = Image.from_base64(f'data:{mime};base64,{b64}')

        try:
            return self.client.create(
                response_model=self.result_model,
                max_retries=settings.IMAGE_PARSER_MAX_RETRIES,
                messages=[{'role': 'user', 'content': [self.prompt, img]}],
            )
        except Exception as exc:
            import openai

            if isinstance(exc, (openai.APIConnectionError, openai.APITimeoutError, openai.InternalServerError)):
                raise ParseTransientError(str(exc)) from exc

            raise ParseError(str(exc)) from exc
