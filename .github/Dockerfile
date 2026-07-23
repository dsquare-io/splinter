FROM node:24-alpine AS node

COPY ui/package.json /app/package.json
COPY ui/package-lock.json /app/package-lock.json

WORKDIR /app
RUN npm install

COPY ui/ /app/

ARG SENTRY_URL
ARG SENTRY_ORG
ARG SENTRY_PROJECT
ARG SENTRY_AUTH_TOKEN
ENV SENTRY_URL=$SENTRY_URL
ENV SENTRY_ORG=$SENTRY_ORG
ENV SENTRY_PROJECT=$SENTRY_PROJECT
ENV SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN

RUN npm run build

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

COPY --from=node /app/dist/ /app/ui
CMD ["gunicorn", "--name=splinter", "splinter.wsgi:application", "--bind=0.0.0.0:8000"]
