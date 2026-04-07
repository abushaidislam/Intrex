# Intrex

**B2B Compliance & SSL Monitoring Platform**

Intrex is a multi-tenant SaaS platform that helps businesses with multiple branches stay on top of regulatory compliance deadlines (trade licenses, fire safety, tax/VAT, environmental permits) and SSL certificate expirations through automated monitoring and smart multi-channel notifications.

Built for businesses operating across multiple locations — from head offices to branch managers — Intrex ensures nothing falls through the cracks with proactive deadline tracking, certificate expiry alerts, and audit-ready documentation.

## Core Features

| Feature | Description |
|---------|-------------|
| **Obligation Tracking** | Create compliance templates (trade license, fire safety, tax/VAT, environmental permits), auto-generate recurring deadlines per branch, track status (upcoming/due/overdue/completed) |
| **Multi-Branch Management** | Hierarchical organization (Head Office → Branches), jurisdiction-based rules (City Corporation/District), branch-specific compliance assignments |
| **SSL Certificate Monitoring** | Track domain certificates per branch, auto-check expiry every 12 hours, alert on failures (DNS/timeout/handshake errors) |
| **Smart Notifications** | Multi-channel alerts via Email SMTP, Telegram Bot, WhatsApp Business, Webhooks; severity-based routing; acknowledgment tracking with audit trails |
| **Document Management** | Upload compliance proof (certificates, renewals) attached to obligations, secure storage with access control |
| **Role-Based Access** | 3-tier hierarchy: Head Office Admin, Branch Manager, Operator with scoped permissions |
| **Activity Audit Logs** | Complete audit trail of all actions — who created/completed obligations, notification deliveries, user logins |

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) (App Router) + React 19 + TypeScript
- **Auth & Database**: [Supabase](https://supabase.com) (Auth + Postgres + Storage)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team) with Row Level Security (RLS)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com) + shadcn/ui components
- **Payments**: [Stripe](https://stripe.com) (optional, configurable)
- **Deployment**: [Vercel](https://vercel.com) with Cron Jobs

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm (recommended) or npm
- Supabase account
- (Optional) Stripe account for billing
- (Optional) SMTP credentials for email notifications

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/intrex.git
cd intrex

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials (see Environment Variables section)

# Run database migrations
pnpm db:migrate

# Seed Bangladesh jurisdiction data and templates
pnpm db:seed

# Start development server
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Environment Variables

Create a `.env` file with the following variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `POSTGRES_URL` | Yes | Supabase PostgreSQL connection string |
| `AUTH_SECRET` | Yes | Random string for session encryption (generate with `openssl rand -base64 32`) |
| `BASE_URL` | Yes | Base URL of your app (e.g., `http://localhost:3000` or `https://intrex.flinkeo.online`) |
| `PLATFORM_SMTP_HOST` | No* | SMTP server for email notifications (e.g., `smtp.gmail.com`) |
| `PLATFORM_SMTP_PORT` | No* | SMTP port (usually `587`) |
| `PLATFORM_SMTP_USER` | No* | SMTP username/email |
| `PLATFORM_SMTP_PASS` | No* | SMTP password or app-specific password |
| `PLATFORM_EMAIL_FROM` | No* | Sender name and email (e.g., `"Intrex" <notifications@intrex.flinkeo.online>`) |
| `STRIPE_SECRET_KEY` | No | Stripe secret key (for billing) |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe webhook secret |

*Required for email notifications. Other channels (Telegram, WhatsApp, Webhook) can be configured via the UI.

## Database Setup

The application uses Supabase Postgres with the following key tables:

- `tenants` — Customer businesses
- `branches` — Business locations under tenants
- `users` — Users with role-based access (head_office_admin, branch_manager, operator)
- `obligation_templates` — Reusable compliance rule definitions
- `obligation_instances` — Actual due items for branches
- `domains` — Domains for SSL monitoring
- `ssl_check_results` — SSL certificate check results
- `connectors` — Notification channel configurations
- `notification_routes` — Routing rules by event/severity
- `notification_events` — Queued notification jobs
- `activity_logs` — Audit trail

See [Architeach.md](./Architeach.md) for complete schema documentation.

## Cron Jobs (Vercel)

The application uses Vercel Cron for background processing:

| Endpoint | Schedule | Purpose |
|----------|----------|---------|
| `/api/cron/ssl-scan` | Every 12 hours | Check all domain SSL certificates |
| `/api/cron/process-notifications` | Every 5 minutes | Process queued notification events |
| `/api/cron/retries` | Every 5 minutes | Retry failed notifications |
| `/api/cron/recurrence` | Daily at 2 AM | Generate recurring obligations |

Configure in `vercel.json` or Vercel dashboard.

## Project Structure

```
/app
  /(dashboard)        # Protected dashboard routes
    /branches         # Branch management
    /obligations      # Compliance tracking
    /domains          # SSL monitoring
    /connectors       # Notification channels
    /notifications    # Notification history
    /dashboard        # Main dashboard & activity logs
    /templates        # Obligation templates
    /pricing          # Subscription plans
  /(login)            # Authentication pages
  /api                # API routes & cron endpoints
/lib
  /auth               # Session management & RBAC
  /db                 # Drizzle ORM, schema, migrations
  /connectors         # Email, Telegram, WhatsApp, Webhook
  /notifications      # Notification orchestration
  /ssl                # SSL certificate checking
  /email              # Platform email service
/components/ui        # shadcn/ui components
```

## Available Scripts

```bash
pnpm dev              # Start development server with Turbopack
pnpm build            # Build for production
pnpm db:generate      # Generate Drizzle migrations
pnpm db:migrate       # Run database migrations
pnpm db:studio        # Open Drizzle Studio
pnpm db:seed          # Seed jurisdiction & template data
```

## Architecture

Intrex follows a modern serverless architecture:

- **App Layer**: Next.js Route Handlers for API endpoints and server functions
- **Compliance Engine**: Obligation lifecycle, recurrence generation, escalation
- **SSL Monitor**: TLS handshake checking, certificate parsing, expiry detection
- **Notification Orchestrator**: Route resolution, deduplication, retries, acknowledgments
- **Connector Adapters**: Pluggable channels (Email, Telegram, WhatsApp, Webhook)

See [Architeach.md](./Architeach.md) for detailed specification including:
- Entity relationship diagrams
- Notification routing algorithm
- SSL check algorithm
- Security controls & RLS policies
- API surface documentation

## Security

- **Authentication**: Supabase Auth with JWT sessions
- **Authorization**: Row Level Security (RLS) on all tenant tables + server-side role checks
- **Encryption**: Connector secrets encrypted at rest, decrypted only server-side
- **Audit**: Immutable activity logs for all actions
- **Webhook Security**: HMAC SHA-256 signed payloads

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Add environment variables
4. Deploy

### Database

Supabase is recommended. Ensure you:
1. Enable Row Level Security on all tables
2. Configure RLS policies for tenant isolation
3. Set up connection pooling for serverless

## License

MIT © [Flinkeo](https://flinkeo.online)

---

**Domain**: [intrex.flinkeo.online](https://intrex.flinkeo.online)  
**Support**: For technical issues or feature requests, please open an issue on GitHub.
