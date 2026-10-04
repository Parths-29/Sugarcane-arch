# DesiCane - Architecture Comparison Project
## Complete Demo Guide for Teacher Presentation

---

## What Is This Project?

**DesiCane** is an AI-powered irrigation advisory system built for sugarcane farmers in Northern Karnataka.

The main purpose is to implement the same farming advisory application using **3 completely different software architectures** and compare how each performs, scales, and handles failures.

### The 3 Architectures Implemented:

| Architecture   | Backend Port           | Description                                    |
|:---------------|:-----------------------|:-----------------------------------------------|
| Monolith       | 4000                   | Everything in one single Node.js application   |
| Three-Tier     | 80 (Nginx) + 4001 (API)| Separated Web Tier (Nginx) and Logic Tier      |
| Microservices  | 8000 (Gateway)         | 6 independent services, each doing one job     |

---

## Project Folder Structure

```
Sugarcane-arch/
|
|-- frontend/              <- React + Vite UI (shared by all architectures)
|
|-- monolith/              <- Architecture 1: Single Node.js server
|   |-- src/modules/
|   |   |-- auth/          <- Login, Registration
|   |   `-- advisory/      <- Irrigation ML advisory
|   `-- Dockerfile
|
|-- three-tier/            <- Architecture 2: Nginx + Express
|   |-- presentation/      <- Nginx reverse proxy (Web Tier)
|   `-- logic/             <- Express API (Logic Tier)
|
|-- microservices/         <- Architecture 3: 6 separate services
|   |-- gateway/           <- API Gateway (Port 8000)
|   |-- auth/              <- Authentication Service (Port 8001)
|   |-- weather/           <- Weather Service (Port 8002)
|   |-- advisory/          <- ML Advisory in Python (Port 8003)
|   |-- translation/       <- Language Translation (Port 8004)
|   |-- notification/      <- Redis Notification Queue (Port 8005)
|   `-- monitoring/        <- Prometheus + Grafana configs
|
|-- benchmarks/            <- Load testing and fault demo scripts
`-- docs/                  <- Project documentation
```

---

## Microservices - Deep Dive

The microservices architecture is the most advanced implementation. Here is what every service does:

### 1. API Gateway (Port 8000)
- **Language**: Node.js / TypeScript / Express
- **Role**: The single entry point for all requests from the frontend
- **What it does**:
  - Receives every request from the browser
  - Verifies the farmer's JWT login token
  - Applies rate limiting (max 100 requests/minute per IP)
  - Implements a Circuit Breaker Pattern (if Weather service fails 3 times, it stops calling it and uses cached data instead)
  - Orchestrates calls to Weather > Advisory > Translation services in sequence
  - Assigns a unique Request ID to every request for tracking

### 2. Auth Service (Port 8001)
- **Language**: Node.js / TypeScript / Mongoose
- **Database**: MongoDB Atlas (Cloud)
- **What it does**:
  - Handles farmer registration (POST /register)
  - Handles farmer login (POST /login)
  - Validates 10-digit Indian mobile numbers
  - Hashes passwords with bcrypt (12 rounds - extremely secure)
  - Issues JWT tokens for stateless authentication

### 3. Weather Service (Port 8002)
- **Language**: Node.js / TypeScript
- **What it does**:
  - Fetches real-time weather data from Open-Meteo API for sugarcane farming districts
  - Extracts 3 key agricultural values:
    - ET0 - Evapotranspiration (how much water the crop loses to heat and wind)
    - 3-day projected rainfall
    - Maximum temperature
  - Caches results in memory for 10 minutes to avoid API overuse

### 4. Advisory Service (Port 8003) - The AI/ML Service
- **Language**: Python 3.11 / FastAPI / Scikit-Learn
- **What it does**:
  - Uses the FAO-56 agronomic formula: ETc = ET0 x Kc
    - Kc (Crop Coefficient) changes per growth stage (Germination: 0.40 to Grand Growth: 1.25)
  - Runs a trained RandomForestClassifier machine learning model
  - Input: Growth stage, soil moisture %, weather data
  - Output:
    - decision: "irrigate", "delay", or "skip"
    - irrigationMm: Exact millimeters of water needed
    - explanationFeatures: SHAP-like feature contributions (explainable AI)
  - Exposes Prometheus metrics: advisory_decisions_total, advisory_duration_seconds

### 5. Translation Service (Port 8004)
- **Language**: Node.js / TypeScript
- **What it does**:
  - Translates the advisory into the farmer's regional language
  - Supports 6 languages: English, Kannada, Hindi, Marathi, Tamil, Telugu

### 6. Notification Service (Port 8005) + Redis Queue
- **Language**: Node.js / TypeScript + Redis message broker
- **What it does**:
  - When an advisory is generated, a notification job is pushed to a Redis Stream queue
  - The notification service picks up jobs asynchronously in the background
  - Translates and formats the SMS/push message
  - Masks the phone number for privacy (+91 98XXXX3210)
  - The API response is NOT delayed by notification sending - it runs in the background

---

## What Does Prometheus Do in This Project?

Prometheus is an open-source monitoring and alerting system.

### Role in DesiCane:
- Prometheus runs as a Docker container on Port 9090
- Every 5 seconds, it automatically scrapes the /metrics endpoint of all 6 microservices
- It stores this as time-series data (value + timestamp)

### Metrics Collected:

| Metric                        | What It Means                                                        |
|:------------------------------|:---------------------------------------------------------------------|
| up                            | Is each microservice running? (1 = Online, 0 = Down)                |
| gateway_requests_total        | Total API requests, broken down by route and HTTP status             |
| circuit_breaker_state         | 0=Closed (healthy), 1=Open (tripped), 2=Half-Open (recovering)       |
| fallback_total                | How many times stale cached weather data was used                    |
| auth_registrations_total      | Total new farmers registered                                         |
| auth_logins_total             | Total successful farmer logins                                       |
| advisory_decisions_total      | How many ML decisions (irrigate/delay/skip) were made               |
| advisory_duration_seconds     | How long the ML model takes per advisory                             |
| translations_total            | Translations served, per language                                    |
| notification_queue_lag        | Unprocessed notifications waiting in the Redis queue                 |

### How to Use Prometheus During Demo:
1. Open: http://localhost:9090
2. Click Status > Targets - See all 6 services with green UP status
3. In the Query box, type:
   - up - See all online services
   - gateway_requests_total - See API traffic
   - circuit_breaker_state - See circuit breaker health
   - advisory_decisions_total - See how many AI decisions were made

---

## What Does Grafana Do in This Project?

Grafana is a visualization and dashboarding platform.

### Role in DesiCane:
- Grafana runs on Port 3000
- It connects to Prometheus as its data source
- Displays live, auto-refreshing dashboards with charts, gauges, and graphs
- No login required (anonymous viewer access is enabled)

### "DesiCane Microservices Live Dashboard" Shows:
1. Gateway Request Traffic Graph - Real-time requests per second, colored by route
2. Circuit Breaker Status Gauge - Green = Healthy, Red = Tripped, Yellow = Recovering
3. Stale Cache Fallback Counter - How many times the system survived a weather service failure
4. Microservices Online Status - Grid showing all 6 services as ONLINE / OFFLINE
5. Auth Activity - Timeline of login and registration events

### How to Use Grafana During Demo:
1. Open: http://localhost:3000/dashboards
2. Click "DesiCane Microservices Live Dashboard"
3. Watch live metrics update every 5 seconds!

---

## What Does Docker Do in This Project?

Docker is a containerization platform. Think of it as putting every service into its own sealed, self-contained box.

### Why Docker is Used:
- Every microservice runs in its own Docker container - completely isolated
- The entire 9-container system starts with ONE command: docker compose up
- No manual Node.js or Python installation needed for each service
- Services communicate via a private internal Docker network (ms-net) - only the Gateway is exposed to the outside

### All Docker Containers in This Project:

| Container    | Base Image        | What Runs Inside                     |
|:-------------|:------------------|:-------------------------------------|
| gateway      | Node 20 Alpine    | API Gateway (TypeScript compiled)    |
| auth         | Node 20 Alpine    | Auth service + MongoDB Atlas         |
| weather      | Node 20 Alpine    | Weather fetching and caching         |
| advisory     | Python 3.11 Slim  | FastAPI + Scikit-Learn ML model      |
| translation  | Node 20 Alpine    | Regional language translations       |
| notification | Node 20 Alpine    | Background worker + Redis consumer   |
| redis        | Redis 7 Alpine    | In-memory message queue (broker)     |
| prometheus   | prom/prometheus   | Metrics scraper                      |
| grafana      | grafana/grafana   | Dashboard visualizer                 |

---

## TEACHER DEMO - Step-by-Step Commands

Run all commands in PowerShell

---

### STEP 1 - Confirm Docker is Running

```powershell
docker version
```

Expected: Shows Client and Server version (29.x.x)

---

### STEP 2 - Navigate to Microservices Folder

```powershell
cd C:\Users\Admin\Desktop\Agri\Sugarcane-arch\microservices
```

---

### STEP 3 - Start All 9 Containers (The Main Command)

```powershell
docker compose up --build -d
```

--build rebuilds images with latest code. -d runs them in the background (detached).

Expected output:
```
Container microservices-redis-1         Started
Container microservices-prometheus-1    Started
Container microservices-grafana-1       Started
Container microservices-auth-1          Started
Container microservices-weather-1       Started
Container microservices-advisory-1      Started
Container microservices-translation-1   Started
Container microservices-notification-1  Started
Container microservices-gateway-1       Started
```

---

### STEP 4 - Verify All Containers Are Healthy

```powershell
docker ps
```

Expected: 9 containers listed, all with STATUS: Up

---

### STEP 5 - Start the Frontend Website

Open a NEW PowerShell window and run:

```powershell
cd C:\Users\Admin\Desktop\Agri\Sugarcane-arch\frontend
node dev.js
```

Expected:
```
VITE v5.4.21  ready in 1398 ms
  Local:   http://localhost:5173/
```

---

### STEP 6 - Open Website in Chrome

```
http://localhost:5173
```

Log in or register a new farmer account.

---

### STEP 7 - Show the Architecture Demo Page

```
http://localhost:5173/arch-demo
```

This lets you:
1. Submit a field advisory request (growth stage, soil moisture, village)
2. See the ML decision - "Irrigate X mm" / "Delay" / "Skip"
3. See the explanation in the farmer's chosen regional language
4. All served live through the 6-service microservices pipeline

---

### STEP 8 - Show Prometheus

```
http://localhost:9090
```

1. Status > Targets - Show all 6 services with green UP badge
2. Query tab - type "up" - Execute - All show value 1
3. Type "gateway_requests_total" - Shows API call count
4. Type "advisory_decisions_total" - Shows AI decision count

---

### STEP 9 - Show Grafana Live Dashboard

```
http://localhost:3000/dashboards
```

Click "DesiCane Microservices Live Dashboard" and point out:
- Gateway Traffic graph (live updates)
- Circuit Breaker gauge (green = healthy)
- All 6 service status panels (ONLINE)
- Auth logins and registrations timeline

---

### STEP 10 - Live Fault Injection Demo (Optional but Impressive!)

Show the system is fault-tolerant - killing one service does NOT crash everything:

```powershell
# Stop the weather service
docker stop microservices-weather-1
```

Now request an advisory from the website at http://localhost:5173/arch-demo

The advisory STILL WORKS - using cached weather data (staleWeather: true).
This is the Circuit Breaker in action!

Watch Grafana: circuit_breaker_state goes from 0 (Closed) to 1 (Open)

```powershell
# Bring weather service back
docker start microservices-weather-1
```

Watch Grafana: circuit breaker recovers back to 0 (Closed)

---

### STEP 11 - Shut Everything Down Cleanly

```powershell
# In the microservices folder:
docker compose down

# In the frontend window: press Ctrl+C
```

---

## Quick Reference - All URLs

| Service              | URL                             | What to Show                             |
|:---------------------|:--------------------------------|:-----------------------------------------|
| Frontend App         | http://localhost:5173           | Full UI - Login, Dashboard, Weather      |
| Architecture Demo    | http://localhost:5173/arch-demo | Live microservice pipeline demo          |
| Prometheus           | http://localhost:9090           | Metrics, Targets, Queries                |
| Grafana Dashboard    | http://localhost:3000/dashboards| Live visual dashboard                    |
| Gateway Health       | http://localhost:8000/health    | {"status":"ok","service":"gateway"}      |
| Auth Health          | http://localhost:8001/health    | {"status":"ok","service":"auth"}         |
| Weather Health       | http://localhost:8002/health    | {"status":"ok","service":"weather"}      |
| Advisory Health      | http://localhost:8003/health    | {"status":"ok","service":"advisory"}     |
| Translation Health   | http://localhost:8004/health    | {"status":"ok","service":"translation"}  |
| Notification Health  | http://localhost:8005/health    | {"status":"ok","service":"notification"} |

---

## Key Concepts to Explain to Teacher

| Concept               | What It Is                                               | Where Used in Project                       |
|:----------------------|:---------------------------------------------------------|:--------------------------------------------|
| Microservices         | Breaking one big app into small, independent services    | All 6 services in microservices/            |
| API Gateway           | Single entry point that routes and secures all requests  | gateway/ on Port 8000                       |
| Circuit Breaker       | Stops calling a failing service, uses cached data        | Gateway to Weather service                  |
| JWT                   | Secure, stateless login token                            | Auth service signs it, Gateway verifies it  |
| Redis Stream Queue    | Async message broker - decouples notification from API   | Notification service                        |
| Prometheus            | Scrapes and stores metrics every 5 seconds              | Port 9090                                   |
| Grafana               | Visualizes Prometheus data as live charts               | Port 3000                                   |
| Docker Compose        | Starts all 9 containers with one command                | microservices/docker-compose.yml            |
| RandomForestClassifier| ML model that predicts irrigate/delay/skip              | Advisory service (Python/FastAPI)           |
| FAO-56 ETc Formula    | Scientific formula: ETc = ET0 x Kc                      | Advisory service                            |
| Rate Limiting         | Prevents API abuse - max 100 requests/minute per IP     | Gateway middleware                          |
| bcrypt Hashing        | One-way password encryption (12 rounds)                 | Auth service                                |

---

Project built for: KIAAR x Godavari Biorefineries Ltd. - Sugarcane Irrigation Architecture Comparison Study
