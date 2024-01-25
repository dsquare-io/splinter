FROM python:3.12

RUN pip install -U pip && pip install gunicorn --no-cache-dir

COPY pyproject.toml /app/
COPY splinter/__init__.py /app/splinter/
RUN pip install -e /app --no-cache-dir

COPY splinter /app/splinter

WORKDIR /app
RUN splinter collectstatic --no-input
