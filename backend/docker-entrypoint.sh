#!/bin/sh
set -e

echo "==> Josbin Fleet MS backend starting..."

# Install PHP dependencies if vendor is missing or outdated
if [ ! -f "vendor/autoload.php" ]; then
  echo "==> Running composer install..."
  composer install --no-interaction --optimize-autoloader --no-dev
fi

# Write a .env from Docker environment variables so that php artisan serve
# child processes (which don't inherit Docker env vars) pick up the right config
echo "==> Writing .env from environment..."
cat > .env <<EOF
APP_NAME=${APP_NAME:-Josbin_Fleet_MS}
APP_ENV=${APP_ENV:-local}
APP_KEY=${APP_KEY:-}
APP_DEBUG=${APP_DEBUG:-true}
APP_URL=${APP_URL:-http://localhost:8000}

LOG_CHANNEL=stack
LOG_LEVEL=debug

DB_CONNECTION=${DB_CONNECTION:-mysql}
DB_HOST=${DB_HOST:-mysql}
DB_PORT=${DB_PORT:-3306}
DB_DATABASE=${DB_DATABASE:-josbin_fleet_ms}
DB_USERNAME=${DB_USERNAME:-josbin_fleet_ms}
DB_PASSWORD=${DB_PASSWORD:-josbin_fleet_ms}

SESSION_DRIVER=${SESSION_DRIVER:-file}
SESSION_LIFETIME=120
CACHE_STORE=${CACHE_STORE:-file}
QUEUE_CONNECTION=${QUEUE_CONNECTION:-sync}
FILESYSTEM_DISK=local

MAIL_MAILER=${MAIL_MAILER:-log}
MAIL_HOST=${MAIL_HOST:-127.0.0.1}
MAIL_PORT=${MAIL_PORT:-2525}
MAIL_USERNAME=${MAIL_USERNAME:-null}
MAIL_PASSWORD=${MAIL_PASSWORD:-null}
MAIL_FROM_ADDRESS=${MAIL_FROM_ADDRESS:-noreply@josbin.sr}
MAIL_FROM_NAME="\${APP_NAME}"

FLEET_ADMIN_EMAIL=${FLEET_ADMIN_EMAIL:-admin@josbin.sr}
FLEET_ADMIN_WHATSAPP=${FLEET_ADMIN_WHATSAPP:-}

TWILIO_SID=${TWILIO_SID:-}
TWILIO_TOKEN=${TWILIO_TOKEN:-}
TWILIO_WHATSAPP_FROM=${TWILIO_WHATSAPP_FROM:-+14155238886}

FRONTEND_URL=${FRONTEND_URL:-http://localhost:5173}
EOF

# Generate app key only if APP_KEY is empty
if [ -z "$APP_KEY" ]; then
  echo "==> Generating APP_KEY..."
  php artisan key:generate --force --no-interaction
fi

# Run any pending migrations
echo "==> Running migrations..."
php artisan migrate --force --no-interaction

# Clear compiled config/cache
php artisan config:clear
php artisan cache:clear

echo "==> Starting PHP server on 0.0.0.0:8000"
exec php artisan serve --host=0.0.0.0 --port=8000
