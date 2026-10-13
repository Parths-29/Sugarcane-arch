# Sugarcane Architecture Demo

Three architectural implementations of the DesiCane irrigation advisory system.

## Running

1. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. **Monolith**:
   ```bash
   cd monolith
   docker compose up --build
   ```
   (Set `VITE_API_BASE_URL=http://localhost:4000` in frontend `.env.example`)

3. **Three-Tier**:
   ```bash
   cd three-tier
   docker compose up --build
   ```
   (Set `VITE_API_BASE_URL=http://localhost:80` in frontend `.env.example`)

4. **Microservices**:
   ```bash
   cd microservices
   docker compose up --build
   ```
   (Set `VITE_API_BASE_URL=http://localhost:8000` in frontend `.env.example`)

See `/docs` for full details.

For the Redis, Prometheus, and Grafana live demo workflow, see [`docs/devops-demo.md`](docs/devops-demo.md).
