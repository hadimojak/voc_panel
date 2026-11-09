# درخواست استقرار Kubernetes — SMART / VOC Panel

**مخاطب:** DevOps / Infra  
**فرستنده:** تیم توسعه  
**تاریخ:** ۱۴۰۴/۰۸/۱۸  

با سلام؛ لطفاً سرویس‌های زیر را روی Kubernetes (مشابه الگوی Helm سوپرسِت و Kernoon) Deploy کنید.

## سرویس‌ها

| سرویس | ریپو / منبع | پورت | نکته |
|--------|-------------|------|------|
| Backend API | `voc_panel` (NestJS) | `5001` | auth، تیکت، تماس، CRM sync، **صدور guest token سوپرسِت** |
| Frontend | `smart-dashboard` (React+Nginx) | `80` | Dockerfile آماده؛ `VITE_API_BASE_URL` در بیلد |
| **Apache Superset** | **سرویس مستقل (Helm موجود شرکت)** | **`8088`** | **باید مثل بقیه سرویس‌ها بالا بیاید** — Deployment + Service + Ingress |
| Postgres | managed / chart | `5432` | دیتابیس Backend |
| Redis | managed / chart | `6379` | کش / session |
| RabbitMQ | managed / chart | `5672` | صف پیام |

ترجیح وابستگی‌ها: سرویس managed/اشتراکی کلاستر.

---

## Apache Superset — جزئیات سرویس (الزامی)

Superset در این پروژه **بخش اختیاری یا دستی نیست**؛ یک **سرویس runtime** است که باید در همان محیط (Staging/Production) مثل API و Frontend بالا باشد.

### نقش در SMART

- داشبوردها و نمودارهای تحلیلی VOC داخل UI اسمارت **embed** می‌شوند.
- Frontend داشبورد را با `@superset-ui/embedded-sdk` نشان می‌دهد.
- Backend (`voc_panel`) نقش **token broker** را دارد: کاربر لاگین‌شده SMART با permission `dashboard.view` از API بک‌اند guest token می‌گیرد؛ فرانت مستقیم با یوزر/پسورد Superset حرف نمی‌زند.

### فلو اتصال

```
Browser (smart-dashboard)
    │  POST /superset/guest-token  { dashboardId }   (JWT کاربر SMART)
    ▼
voc_panel  (SupersetService)
    │  1) POST {SUPERSET_URL}/api/v1/security/login
    │  2) GET  /api/v1/security/csrf_token/
    │  3) POST /api/v1/security/guest_token/   (resource = dashboard)
    ▼
Apache Superset :8088
    │  iframe / embedded SDK با guest token
    ▼
Dashboard embed در صفحه داشبورد SMART
```

Endpoint بک‌اند:

- `POST /superset/guest-token`
- Body: `{ "dashboardId": "<uuid-or-id>" }`
- Auth: Bearer JWT + permission `dashboard.view`
- Response: `{ "token": "..." }`

کد مربوطه: `src/superset/superset.service.ts` و `src/superset/superset.controller.ts`.

### آنچه DevOps باید Deploy کند

1. **Deployment / StatefulSet** برای Apache Superset (ترجیحاً همان **Helm chart موجود شرکت**).
2. **Service** داخلی روی پورت `8088` (نام پیشنهادی: `superset` در namespace مربوطه، مثلاً `smart`).
3. **Ingress / TLS** برای:
   - UI ادمین سوپرسِت (ساخت داشبورد، اتصال DB، publish)
   - دسترسی embed از مرورگر کاربر (دامنه باید در `FEATURE_FLAGS` / CORS / embedded domain allow-list سوپرسِت مجاز باشد).
4. **Secret** برای ادمین سوپرسِت و `SUPERSET_SECRET_KEY`.
5. دیتابیس متادیتای سوپرسِت (Postgres جدا یا schema جدا — طبق استاندارد Helm شما).
6. شبکه:
   - **Backend → Superset** (داخل کلاستر، `SUPERSET_URL` مثلاً `http://superset.smart.svc.cluster.local:8088`)
   - **Browser → Superset** (برای iframe/embed؛ دامنه عمومی یا همان Ingress)
   - CORS / `TALISMAN` / `GUEST_ROLE_NAME` / Embedded domain مطابق نیاز embed

### متغیرهای Backend مرتبط با Superset

| متغیر | نمونه | توضیح |
|--------|--------|--------|
| `SUPERSET_URL` | `http://superset:8088` یا URL Ingress | پایه API سوپرسِت برای login و guest token |
| `SUPERSET_USERNAME` | `admin` | کاربر سرویس‌اکانت بک‌اند روی سوپرسِت |
| `SUPERSET_PASSWORD` | (Secret) | رمز همان کاربر |
| `SUPERSET_PROVIDER` | `db` | معمولاً `db` |

این‌ها در `.sample.env` و validation بک‌اند **الزامی** هستند؛ بدون سوپرسِتِ در دسترس، صدور guest token شکست می‌خورد.

### کارهای بعد از بالا آمدن سرویس

- ساخت/ورود کاربر admin (یا استفاده از مقادیر Secret)
- فعال‌سازی **Embedded dashboards** در Superset
- Publish کردن داشبوردهای VOC و دادن `dashboardId` به Frontend/Backend
- اتصال Superset به Postgres داده VOC (read-only توصیه می‌شود) برای datasetها
- تست: Login SMART → صفحه داشبورد → `POST /superset/guest-token` → رندر embed بدون خطای CORS/CSRF

### لوکال (docker compose)

در `docker-compose.yml` همین ریپو سرویس `superset` تعریف شده است:

```bash
docker compose up -d
# UI: http://localhost:8088
# پیش‌فرض: admin / admin  (با SUPERSET_* در env هم‌خوان باشد)
```

---

## درخواست از DevOps (چک‌لیست)

1. Namespace (مثلاً `smart`) + Deployment/Service/Ingress/TLS برای API و Frontend  
2. **استقرار Apache Superset به‌عنوان سرویس مستقل** (Helm) + Service `:8088` + Ingress + Secret  
3. تنظیم `SUPERSET_URL` بک‌اند روی آدرس داخلی کلاستر سوپرسِت  
4. Dockerfile Backend (اگر استاندارد شماست) + Secret/ConfigMap  
5. CORS فرانت ↔ API و `VITE_API_BASE_URL`  
6. CORS / Embedded domain بین Frontend و Superset  
7. egress Backend به `crm.dayins.com` (همگام‌سازی CRM)  
8. اعلام URLهای Staging/Production برای: API · Frontend · **Superset**

## env ضروری Backend (خلاصه)

`POSTGRES_*` · `REDIS_*` · `RABBITMQ_*` · `JWT_*` ·  
`SUPERSET_URL` / `SUPERSET_USERNAME` / `SUPERSET_PASSWORD` / `SUPERSET_PROVIDER=db` ·  
`CRM_FETCH_URL` / `CRM_CALLS_FETCH_URL` / `CRM_SYNC_ENABLED=true` ·  
`TYPEORM_SYNCHRONIZE=false` (prod)

## وضعیت توسعه

- Frontend Dockerfile آماده · Backend هنوز Dockerfile ندارد (در صورت نیاز طبق `kernoon-back` می‌سازیم)  
- Compose لوکال: Postgres + Redis + RabbitMQ + **Superset**  
- پس از Deploy: تست Login، تیکت، CRM sync، و **embed داشبورد Superset با guest token**

با احترام،  
تیم توسعه SMART / VOC Panel
