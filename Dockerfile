FROM python:3.12-alpine

RUN pip install -U pip && pip install gunicorn --no-cache-dir

COPY pyproject.toml /app/
COPY splinter/__init__.py /app/splinter/
RUN pip install -e /app --no-cache-dir

WORKDIR /app
COPY splinter /app/splinter
RUN splinter collectstatic --no-input

CMD ["gunicorn", "--name=splinter", "splinter.wsgi:application", "--bind=0.0.0.0:8000"]
