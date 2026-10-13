# DevOps Demo Runbook

This runbook generates real API traffic and Redis Stream messages for Prometheus and Grafana.

## Start the stack

From PowerShell:

```powershell
cd C:\Users\Admin\Desktop\Agri\Sugarcane-arch\microservices
docker compose --env-file ..\.env up --build -d
docker compose ps
```

The auth service needs a working `MONGODB_URI` in the repository's root `.env` file. Register a farmer account in the app if you do not already have one.

Start the frontend in another PowerShell window:

```powershell
cd C:\Users\Admin\Desktop\Agri\Sugarcane-arch\frontend
node dev.js
```

## Generate visible dashboard activity

You can generate traffic from the site itself: open <http://localhost:5173/arch-demo>, log in with a registered farmer account, then click **Generate Grafana Demo Traffic (12 requests)**. It sends real advisory requests and queues their mock notifications in Redis.

Or run the PowerShell traffic driver from the repository root. Enter the same registered phone and password when prompted:

```powershell
cd C:\Users\Admin\Desktop\Agri\Sugarcane-arch
.\benchmarks\demo_traffic.ps1 -Requests 20
```

Each request logs in or generates a real irrigation advisory through the gateway. Successful advisories are added to the `advisory.created` Redis Stream and consumed by the notification worker. The worker logs a masked mock-SMS message; it does not send an actual SMS.

## Show the practical

- Grafana: <http://localhost:3000/d/desicane-ms>
- Prometheus: <http://localhost:9090/graph>
- Frontend: <http://localhost:5173/arch-demo>

Useful Prometheus queries:

```promql
up
sum(increase(gateway_requests_total[5m]))
advisory_decisions_total
notification_jobs_enqueued_total
notifications_sent_total
notification_queue_lag
notification_pending_messages
notification_redis_up
sum(increase(inventory_actions_total[5m]))
sum(increase(news_articles_generated_total[5m]))
sum(increase(news_generation_requests_total[5m])) by (result)
```

Adding, editing, or removing an inventory item records a bounded Prometheus event from the website. The item name and quantity stay in browser storage and are not used as metric labels. Opening News or generating a topic brief calls Gemini from the gateway; its key is read from the root `.env` file and stays server-side. Generated articles are educational AI briefs, not verified breaking-news reports.

Show the live Redis stream and consumer group without printing message payloads (which include the farmer phone number):

```powershell
docker compose exec redis redis-cli XLEN advisory.created
docker compose exec redis redis-cli XINFO GROUPS advisory.created
```

The Redis stream uses AOF persistence and a named Docker volume, so entries remain available when containers restart. Remove the volume only if you intentionally want to reset the queue:

```powershell
docker compose down -v
```

That last command deletes persisted Redis data.
