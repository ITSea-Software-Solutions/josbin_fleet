# Josbin Fleet MS — Fleet Management System

A full-stack fleet management application built for **Josbin**, Paramaribo, Suriname. Manage vehicles, drivers, services, insurance, inspections, fuel logs, trip logs, and automated notifications — all from a single dashboard.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS v3 |
| Backend | Laravel 11 (PHP 8.4) |
| Auth | Laravel Sanctum (token-based) |
| Database | MySQL 8.0 |
| PDF Reports | barryvdh/laravel-dompdf |
| Notifications | Laravel Mail (SMTP) + Twilio WhatsApp |
| Containerisation | Docker + Docker Compose |

---

## Running with Docker (Recommended)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### 1. Clone / open the project

```bash
cd fleet
```

### 2. Start all services

```bash
docker compose up --build -d
```

This single command will:
- Pull MySQL 8.0, phpMyAdmin, PHP 8.4, Node 20, and Nginx images
- Build the backend and frontend images
- Run `composer install` inside the backend container
- Run all database migrations automatically
- Start all 4 services

### 3. Create the first admin user

```bash
docker exec josbin_fleet_ms_backend php artisan tinker --execute="App\Models\User::create(['name'=>'Admin','email'=>'admin@josbin.sr','password'=>bcrypt('password')])"
```

### 4. Open the app

| Service | URL |
|---|---|
| **Frontend (App)** | http://localhost:5173 |
| **Backend API** | http://localhost:8000/api |
| **phpMyAdmin** | http://localhost:8081 |

### 5. Log in

| Field | Value |
|---|---|
| Email | `admin@josbin.sr` |
| Password | `password` |

> Change the password after first login by updating the user record in phpMyAdmin or via the API.

### Stop the project

```bash
docker compose down
```

### Stop and wipe all data (fresh start)

```bash
docker compose down -v
```

---

## Running Manually (without Docker)

### Prerequisites
- PHP 8.4 + Composer
- Node.js 20 + npm
- MySQL 8.0

### Backend

```bash
cd backend

# Install PHP dependencies
composer install

# Copy and configure environment
cp .env.example .env   # or edit .env directly
# Set DB_CONNECTION, DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD

# Generate app key
php artisan key:generate

# Run migrations
php artisan migrate

# Start the API server
php artisan serve --port=8000
```

### Frontend

```bash
cd frontend

# Install Node dependencies
npm install

# Start the dev server
npm run dev
```

Frontend will be available at http://localhost:5173.

---

## Production Deployment (Ubuntu + Nginx)

### 1. Install system dependencies

```bash
sudo apt update && sudo apt install -y php8.4 php8.4-fpm php8.4-mysql php8.4-mbstring \
  php8.4-xml php8.4-zip php8.4-gd php8.4-curl php8.4-bcmath \
  nginx mysql-server nodejs npm composer git
```

### 2. Clone the project

```bash
git clone <your-repo-url> /var/www/josbin-fleet
cd /var/www/josbin-fleet
```

### 3. Configure the backend

```bash
cd backend
composer install --no-dev --optimize-autoloader
cp .env.example .env
# Edit .env: set APP_ENV=production, APP_DEBUG=false, DB credentials, FRONTEND_URL
php artisan key:generate
php artisan migrate --force
php artisan config:cache
php artisan route:cache
```

### 4. Build the frontend

```bash
cd ../frontend
npm install
VITE_API_URL=https://your-domain.com/api npm run build
# Output is in frontend/dist/
```

### 5. Configure Nginx

```nginx
# /etc/nginx/sites-available/josbin-fleet

# Frontend
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/josbin-fleet/frontend/dist;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
}

# Backend API
server {
    listen 80;
    server_name api.your-domain.com;
    root /var/www/josbin-fleet/backend/public;
    index index.php;

    location / { try_files $uri $uri/ /index.php?$query_string; }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.4-fpm.sock;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/josbin-fleet /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 6. Set permissions

```bash
sudo chown -R www-data:www-data /var/www/josbin-fleet/backend/storage
sudo chmod -R 775 /var/www/josbin-fleet/backend/storage
```

### 7. Schedule automatic notifications

Add to crontab (`crontab -e`):

```cron
* * * * * cd /var/www/josbin-fleet/backend && php artisan schedule:run >> /dev/null 2>&1
```

---

## Docker Services & Ports

| Container | Port | Purpose |
|---|---|---|
| `josbin_fleet_ms_frontend` | 5173 | React app served by Nginx |
| `josbin_fleet_ms_backend` | 8000 | Laravel API (`php artisan serve`) |
| `josbin_fleet_ms_mysql` | 3306 | MySQL 8.0 database |
| `josbin_fleet_ms_phpmyadmin` | 8081 | phpMyAdmin database UI |

### phpMyAdmin Login

| Field | Value |
|---|---|
| Server | `mysql` (auto-filled) |
| Username | `josbin_fleet_ms` |
| Password | `josbin_fleet_ms` |

---

## Database Credentials

| Setting | Value |
|---|---|
| Host | `localhost` (or `mysql` inside Docker) |
| Port | `3306` |
| Database | `josbin_fleet_ms` |
| Username | `josbin_fleet_ms` |
| Password | `josbin_fleet_ms` |
| Root password | `secret` |

---

## API Overview

All protected endpoints require the header:
```
Authorization: Bearer <token>
```
The token is returned by `/api/login`.

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/register` | Register a new user |
| POST | `/api/login` | Login, returns Bearer token |
| POST | `/api/logout` | Revoke token |
| GET | `/api/me` | Get current user |

### Core Resources (CRUD)
| Resource | Endpoint |
|---|---|
| Vehicles | `/api/vehicles` |
| Drivers | `/api/drivers` |
| Services | `/api/services` |
| Insurance | `/api/insurance` |
| Inspections | `/api/inspections` |
| Fuel Logs | `/api/fuel-logs` |
| Trip Logs | `/api/trip-logs` |

Each resource supports `GET /` (list), `POST /` (create), `GET /{id}` (show), `PUT /{id}` (update), `DELETE /{id}` (delete).

### Special Endpoints
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/trip-logs/{id}/end` | End an active trip |
| GET | `/api/dashboard/stats` | Dashboard KPI stats |
| GET | `/api/dashboard/alerts` | Upcoming expiry alerts |
| GET | `/api/notification-logs` | View notification history |
| GET | `/api/reports/fleet-summary` | Download fleet PDF report |
| GET | `/api/reports/vehicle/{id}` | Download vehicle PDF report |
| GET | `/api/reports/driver/{id}` | Download driver PDF report |

---

## Postman Collection

Import `postman/JosbinFleetMS.postman_collection.json` into Postman.

The collection auto-sets the `token` variable after a successful Login or Register call — all other requests pick it up automatically via `{{token}}`.

Set the `base_url` variable to:
- **Docker:** `http://localhost:8000/api`
- **Production:** `https://api.your-domain.com/api`

---

## Features

### Dashboard
- Live KPIs: total vehicles, active drivers, services due, fuel cost
- Alerts panel: upcoming service / insurance / inspection / license expiries

### Vehicle Management
- Add/edit/delete vehicles with plate number, make, model, year, VIN, fuel type, mileage
- Track service date, insurance expiry, inspection date
- Assign a driver to each vehicle

### Driver Management
- Full driver profiles: name, email, phone, WhatsApp, license number & expiry
- Active / inactive / suspended status

### Service Records
- Log service events per vehicle: oil change, tyre rotation, brake check, etc.
- Track garage, cost, status (scheduled / completed / overdue)

### Insurance
- Track insurance policies per vehicle: provider, policy number, type, premium, start/expiry dates

### Inspections
- Schedule and record safety inspections per vehicle
- Status: scheduled / passed / failed

### Fuel Log
- Record every fill-up: liters, cost per liter, total cost, odometer reading, station
- Linked to vehicle and driver

### Trip Log
- Log trips: origin, destination, purpose, start/end odometer
- Start and end trips via API; auto-calculates distance

### PDF Reports
- **Vehicle Report** — full vehicle history: details, services, insurance, fuel, trips
- **Driver Report** — driver profile with trip history and fuel fills
- **Fleet Summary** — landscape overview of all vehicles with status indicators

### Notifications
- Automated email + WhatsApp alerts at 30, 14, and 7 days before:
  - Service due
  - Insurance expiry
  - Inspection due
  - Driver license expiry
- Notification log stored in database, viewable in the Notifications page
- Run manually: `docker exec josbin_fleet_ms_backend php artisan fleet:notify`
- Runs automatically daily at 08:00 via Laravel Scheduler

---

## Notification Configuration

Edit `backend/.env` (or Docker Compose environment variables) to enable email and WhatsApp:

```env
# Email (SMTP)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_mailtrap_user
MAIL_PASSWORD=your_mailtrap_pass
MAIL_FROM_ADDRESS=noreply@josbin.sr

# Fleet admin contact
FLEET_ADMIN_EMAIL=admin@josbin.sr
FLEET_ADMIN_WHATSAPP=+597XXXXXXXX

# Twilio WhatsApp
TWILIO_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_TOKEN=your_auth_token
TWILIO_WHATSAPP_FROM=+14155238886
```

---

## Useful Docker Commands

```bash
# View backend logs live
docker logs -f josbin_fleet_ms_backend

# Run a migration manually
docker exec josbin_fleet_ms_backend php artisan migrate

# Open a Laravel shell (tinker)
docker exec -it josbin_fleet_ms_backend php artisan tinker

# Send fleet notifications now
docker exec josbin_fleet_ms_backend php artisan fleet:notify

# Rebuild after code changes
docker compose up --build -d

# Wipe everything and start fresh
docker compose down -v && docker compose up --build -d
```

---

## Project Structure

```
fleet/
├── backend/                  # Laravel 11 API
│   ├── app/
│   │   ├── Console/Commands/SendFleetNotifications.php
│   │   ├── Http/Controllers/ # 11 controllers
│   │   └── Models/           # Vehicle, Driver, Service, Insurance, ...
│   ├── database/migrations/  # 9 migrations
│   ├── resources/views/reports/  # PDF Blade templates
│   ├── routes/api.php        # All API routes
│   ├── Dockerfile
│   └── docker-entrypoint.sh
├── frontend/                 # React + Vite + TypeScript
│   ├── src/
│   │   ├── pages/            # 11 pages
│   │   ├── components/       # Sidebar, Layout, StatsCard, etc.
│   │   └── api/client.ts     # Axios API client
│   └── Dockerfile
├── postman/
│   └── JosbinFleetMS.postman_collection.json
├── docker-compose.yml
└── README.md
```

---

*Josbin Fleet MS — Built for Josbin, Paramaribo, Suriname*
