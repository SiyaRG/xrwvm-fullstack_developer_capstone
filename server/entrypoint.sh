#!/bin/bash

# Wait for database to be ready (if needed)
# python manage.py wait_for_db

# Run Django migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Start the application
exec "$@"
