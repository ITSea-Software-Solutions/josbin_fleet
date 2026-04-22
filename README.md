# Josbin Fleet MS — Fleet Management System

A full-stack fleet management application built for **Josbin**, Paramaribo, Suriname.  
Manage vehicles, drivers, services, insurance, inspections, fuel logs, trip logs, PDF reports, and automated notifications — all from a single dashboard.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS v3 |
| Backend | Laravel 11 (PHP 8.4) |
| Auth | Laravel Sanctum (Bearer token) |
| Database | MySQL 8.0 |
| PDF Reports | barryvdh/laravel-dompdf |
| Notifications | Laravel Mail (SMTP) + Twilio WhatsApp |
| Containerisation | Docker + Docker Compose |

---

## Installation Guide

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Ports **3000**, **8000**, **8081** must be free on the machine

---

### Step 1 — Clone the repository

```bash
git clone https://github.com/ITSea-Software-Solutions/josbin_fleet.git
cd josbin_fleet
```

---

### Step 2 — Create the backend environment file

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and set the following (minimum required):

```env
APP_KEY=                  # leave blank — auto-generated on first boot
APP_ENV=production
APP_DEBUG=false

DB_HOST=mysql
DB_DATABASE=josbin_fleet_ms
DB_USERNAME=josbin_fleet_ms
DB_PASSWORD=secret
```

> SMTP and WhatsApp credentials are configured later via the **Settings** page inside the app — no need to set them in `.env`.

---

### Step 3 — Build and start all services

```bash
docker compose up -d --build
```

This single command will:
- Pull MySQL 8.0, PHP 8.4, Node 20, Nginx, and phpMyAdmin images
- Build the backend and frontend Docker images
- Run `composer install` inside the backend container
- Auto-generate `APP_KEY` if missing
- Run all database migrations
- Start all 4 services

> **First run takes 3–5 minutes.** Subsequent starts are fast.

---

### Step 4 — Seed the database with demo data

```bash
docker exec josbin_fleet_ms_backend php artisan migrate --seed
```

This creates:
- Default admin user (`admin@josbin.sr` / `password`)
- 8 drivers with Surinamese names
- 10 vehicles with realistic Surinamese plate numbers
- Services, fuel logs, trip logs, and notification settings

---

### Step 5 — Open the app

| Service | URL |
|---|---|
| **App (Frontend)** | http://localhost:3000 |
| **API** | http://localhost:8000/api |
| **phpMyAdmin** | http://localhost:8081 |

---

### Step 6 — Log in

| Field | Value |
|---|---|
| Email | `admin@josbin.sr` |
| Password | `password` |

---

### Step 7 — Configure notifications (optional)

Go to **Settings** in the sidebar and fill in:

- **Admin Email** — where alert emails are sent
- **Admin WhatsApp** — where WhatsApp alerts are sent
- **SMTP credentials** — use [Mailtrap](https://mailtrap.io) for testing or your own SMTP for production
- **Twilio credentials** — for WhatsApp via Twilio sandbox or approved sender
- **Alert thresholds** — e.g. `30,14,7` sends alerts 30, 14, and 7 days before a deadline

Click **Save Settings**, then go to **Notifications** and click **Run Notification Check** to test immediately.

---

## Useful Docker Commands

```bash
# Stop all services
docker compose down

# View backend logs live
docker compose logs -f backend

# Restart after a git pull
git pull && docker compose up -d --build

# Run migrations manually
docker exec josbin_fleet_ms_backend php artisan migrate

# Send fleet notifications manually
docker exec josbin_fleet_ms_backend php artisan fleet:notify

# Open a Laravel shell
docker exec -it josbin_fleet_ms_backend php artisan tinker

# Wipe everything and start fresh
docker compose down -v && docker compose up -d --build
docker exec josbin_fleet_ms_backend php artisan migrate --seed
```

---

## Docker Services & Ports

| Container | Port | Purpose |
|---|---|---|
| `josbin_fleet_ms_frontend` | 3000 | React app served by Nginx |
| `josbin_fleet_ms_backend` | 8000 | Laravel API |
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

## Features

### Dashboard
- Live KPIs: total vehicles, active drivers, services due, fuel cost
- Alerts panel: upcoming service / insurance / inspection / license expiries

### Vehicle Management
- Add, edit, delete vehicles with plate number, make, model, year, VIN, fuel type, mileage
- Track service date, insurance expiry, inspection date
- Assign a driver to each vehicle

### Driver Management
- Full driver profiles: name, email, phone, WhatsApp, license number & expiry
- Active / inactive / suspended status

### Service Records
- Log service events per vehicle: oil change, tyre rotation, brake check, etc.
- Track garage, cost, and status (scheduled / completed / overdue)

### Insurance
- Track insurance policies: provider, policy number, type, premium, start/expiry dates

### Inspections
- Schedule and record safety inspections per vehicle
- Status: scheduled / passed / failed

### Fuel Log
- Record every fill-up: litres, cost per litre, total cost, odometer, station
- Linked to vehicle and driver

### Trip Log
- Log trips: origin, destination, purpose, start/end odometer
- Start and end trips; auto-calculates distance

### PDF Reports
- **Vehicle Report** — full vehicle history: details, services, insurance, fuel, trips
- **Driver Report** — driver profile with trip history and fuel fills
- **Fleet Summary** — landscape overview of all vehicles with status indicators

### Notifications
- Automated email + WhatsApp alerts at configurable thresholds (e.g. 30, 14, 7 days) before:
  - Service due date
  - Insurance expiry
  - Inspection due date
  - Driver license expiry
- **Run on demand** — trigger all scheduled alerts immediately from the Notifications page
- **Manual send** — compose a custom message, choose Email or WhatsApp, pick any recipient, and send instantly
- Full notification history log (channel, recipient, status, timestamp)
- Runs automatically daily at 08:00 via Laravel Scheduler

### Settings
- Configure notification recipients (admin email + WhatsApp)
- Toggle Email and WhatsApp channels on/off
- Set alert day thresholds (e.g. `30,14,7`)
- Enable/disable per-type alerts (service, insurance, inspection, license)
- Full SMTP configuration (host, port, username, password, from address)
- Full Twilio configuration (Account SID, Auth Token, WhatsApp number)
- Test email and WhatsApp buttons to verify setup

---

## API Overview

All protected endpoints require:
```
Authorization: Bearer <token>
```
Token is returned by `POST /api/login`.

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/login` | Login, returns Bearer token |
| POST | `/api/register` | Register a new user |
| POST | `/api/logout` | Revoke current token |
| GET | `/api/me` | Get current user |

### Core Resources (CRUD)
Each supports `GET /` (list), `POST /` (create), `GET /{id}`, `PUT /{id}`, `DELETE /{id}`.

| Resource | Endpoint |
|---|---|
| Vehicles | `/api/vehicles` |
| Drivers | `/api/drivers` |
| Services | `/api/services` |
| Insurance | `/api/insurance` |
| Inspections | `/api/inspections` |
| Fuel Logs | `/api/fuel-logs` |
| Trip Logs | `/api/trip-logs` |

### Special Endpoints
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/trip-logs/{id}/end` | End an active trip |
| GET | `/api/dashboard/stats` | Dashboard KPI stats |
| GET | `/api/dashboard/alerts` | Upcoming expiry alerts |
| GET | `/api/notification-logs` | Notification history |
| GET | `/api/notifications/preview` | Preview upcoming deadlines (no send) |
| POST | `/api/notifications/run` | Trigger scheduled notification check |
| POST | `/api/notifications/manual` | Send a one-off custom notification |
| GET | `/api/settings` | Get all settings |
| PUT | `/api/settings` | Bulk update settings |
| POST | `/api/settings/test-email` | Send a test email |
| POST | `/api/settings/test-whatsapp` | Send a test WhatsApp |
| GET | `/api/reports/fleet-summary` | Download fleet PDF |
| GET | `/api/reports/vehicle/{id}` | Download vehicle PDF |
| GET | `/api/reports/driver/{id}` | Download driver PDF |

---

## Postman Collection

Import `postman/JosbinFleetMS.postman_collection.json` into Postman.

The collection auto-sets the `token` variable after a successful Login call — all other requests use it automatically via `{{token}}`.

Set the `base_url` collection variable to:
- **Docker:** `http://localhost:8000/api`
- **Production:** `https://api.your-domain.com/api`

---

## Production Deployment (Ubuntu + Nginx)

### 1. Install dependencies

```bash
sudo apt update && sudo apt install -y docker.io docker-compose-plugin git
sudo systemctl enable --now docker
```

### 2. Clone and configure

```bash
git clone https://github.com/ITSea-Software-Solutions/josbin_fleet.git /opt/josbin_fleet
cd /opt/josbin_fleet
cp backend/.env.example backend/.env
# Edit backend/.env — set APP_ENV=production, APP_DEBUG=false, DB credentials
```

### 3. Start and seed

```bash
docker compose up -d --build
docker exec josbin_fleet_ms_backend php artisan migrate --seed
```

### 4. Schedule automatic notifications

```bash
crontab -e
```

Add:
```cron
* * * * * docker exec josbin_fleet_ms_backend php artisan schedule:run >> /dev/null 2>&1
```

### 5. (Optional) Reverse proxy with Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
    }
}
```

---

## Project Structure

```
josbin_fleet/
├── backend/                        # Laravel 11 API
│   ├── app/
│   │   ├── Console/Commands/       # SendFleetNotifications command
│   │   ├── Http/Controllers/       # 12 controllers
│   │   └── Models/                 # Vehicle, Driver, Service, ...
│   ├── database/
│   │   ├── migrations/             # 10 migrations
│   │   └── seeders/                # Demo data with Surinamese locale
│   ├── resources/views/reports/    # PDF Blade templates
│   ├── routes/api.php              # All API routes
│   ├── Dockerfile
│   └── docker-entrypoint.sh
├── frontend/                       # React + Vite + TypeScript
│   ├── src/
│   │   ├── pages/                  # 11 pages
│   │   ├── components/             # Sidebar, Layout, Modal, etc.
│   │   └── api/client.ts           # Axios API client
│   └── Dockerfile
├── postman/
│   └── JosbinFleetMS.postman_collection.json
├── docker-compose.yml
└── README.md
```

---

*Josbin Fleet MS — Built for Josbin, Paramaribo, Suriname*
