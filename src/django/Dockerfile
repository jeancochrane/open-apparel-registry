FROM quay.io/azavea/django:2.0-python3.7-slim

RUN mkdir -p /usr/local/src
WORKDIR /usr/local/src

COPY requirements.txt /usr/local/src/
RUN set -ex \
    && deps="git" \
    && apt-get update \
    && apt-get install -y $deps --no-install-recommends \
    && pip install --no-cache-dir -r /usr/local/src/requirements.txt \
    && rm -rf /usr/local/src/requirements.txt /var/lib/apt/lists/*
COPY . /usr/local/src

RUN GOOGLE_GEOCODING_API_KEY="" \
    python manage.py collectstatic --no-input

CMD ["-b :8080", \
"--workers=2", \
"--timeout=60", \
"--access-logfile=-", \
"--access-logformat=%({X-Forwarded-For}i)s %(h)s %(l)s %(u)s %(t)s \"%(r)s\" %(s)s %(b)s \"%(f)s\" \"%(a)s\"", \
"--error-logfile=-", \
"--log-level=info", \
"--capture-output", \
"oar.wsgi"]
