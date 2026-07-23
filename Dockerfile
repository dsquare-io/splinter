FROM python:3.12-alpine

COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /app
ENV UV_PROJECT_ENVIRONMENT=/opt/venv

COPY pyproject.toml uv.lock /app/
RUN uv sync --frozen --no-dev --no-install-project --no-progress

COPY splinter /app/splinter
RUN uv sync --frozen --no-dev --no-progress
ENV PATH="/opt/venv/bin:$PATH"

RUN splinter collectstatic --no-input

CMD ["gunicorn", "--name=splinter", "splinter.wsgi:application", "--bind=0.0.0.0:8000"]
