FROM node:18-alpine AS node

COPY ui/package.json /app/package.json
COPY ui/package-lock.json /app/package-lock.json

WORKDIR /app
RUN npm install

COPY ui/ /app/
RUN npm run build

FROM python:3.12

RUN pip install -U pip && pip install gunicorn --no-cache-dir

COPY pyproject.toml /app/
COPY splinter/__init__.py /app/splinter/
RUN pip install -e /app --no-cache-dir

WORKDIR /app
COPY splinter /app/splinter
RUN splinter collectstatic --no-input

COPY --from=node /app/dist/ /app/ui
CMD ["gunicorn", "--name=splinter", "splinter.wsgi:application", "--bind=0.0.0.0:8000"]
