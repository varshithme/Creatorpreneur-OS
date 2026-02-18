# Creatorpreneur OS — Sales Metrics Dashboard

## Project Overview

A premium B2B SaaS product for tracking sales performance, lead source analytics, and AI-powered insights. The product targets creators and entrepreneurs who want Apple-quality design with serious sales intelligence.

**Current state:** The repo contains a single-file React prototype (`Vibe coded`) that implements core dashboard logic in one component. The planned (and in-progress) build evolves this into a full Next.js application with Supabase auth, Razorpay subscriptions, and server-side API routes.

---

## Architecture

### Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Auth & Database | Supabase (PostgreSQL + Auth + RLS) |
| Payments | Razorpay (subscription billing) |
| AI | Anthropic Claude (`claude-sonnet-4-20250514`) |
| Charts | Recharts |
| Icons | Lucide React |
| Styling | Tailwind CSS |
| Font | SF Pro Display / -apple-system stack |

### Page Structure

```
/                    → Redirect to /login or /dashboard
/login               → Email/password auth (Supabase)
/subscribe           → Razorpay subscription page
/dashboard           → Main dashboard (auth + subscription required)
/api/razorpay/create-subscription  → Server route
/api/razorpay/verify-payment       → Server route
/api/ai/insights                   → Server route (subscription required)
```

### Database Schema (Supabase PostgreSQL)

```sql
-- profiles extends auth.users
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- subscriptions track Razorpay state
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  razorpay_subscription_id TEXT UNIQUE,
  status TEXT DEFAULT 'inactive',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- sales_metrics is the core data table
CREATE TABLE sales_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  month TEXT NOT NULL,
  week TEXT NOT NULL,
  year TEXT NOT NULL,
  week_label TEXT NOT NULL,
  qualified_conversations INTEGER NOT NULL,
  booked_calls INTEGER NOT NULL,
  closed_deals INTEGER NOT NULL,
  booking_rate NUMERIC NOT NULL,
  conversion_rate NUMERIC NOT NULL,
  cash_collected NUMERIC NOT NULL,
  lead_source TEXT NOT NULL,  -- REQUIRED: 'Inbound' | 'Outbound' | 'Referral'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS is enabled on all tables.** Each user can only access their own rows.

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
ANTHROPIC_API_KEY=
NEXT_PUBLIC_APP_URL=
```

Never commit real values. Keep `.env.local` gitignored.

---

## User Flow

1. User signs up via email/password → Profile row + inactive subscription row created automatically
2. Redirected to `/subscribe`
3. Pays via Razorpay → HMAC SHA256 signature verified → subscription activated
4. Accesses `/dashboard`
5. Adds weekly metrics (lead source is **mandatory**)
6. Views KPI cards, charts, lead source breakdown
7. Generates AI insights (subscription-gated)
8. Filters by time period; toggles chart view granularity

---

## Core Features

### Authentication (Supabase)
- Email/password signup and login
- Protected routes redirect to `/login` if unauthenticated
- Subscription check: redirect to `/subscribe` if subscription is inactive
- User profiles table stores `name` field for personalized greeting

### Sales Metrics Tracking
- **Lead source is mandatory** — every entry must be `Inbound`, `Outbound`, or `Referral`
- `booking_rate` and `conversion_rate` are **auto-calculated** on save:
  - `booking_rate = (booked_calls / qualified_conversations) * 100`
  - `conversion_rate = (closed_deals / booked_calls) * 100`
  - Handle division by zero gracefully (return 0)
- Validation: `qualified_conversations >= booked_calls >= closed_deals`
- All numeric fields must be positive integers

### Dashboard Filters
Seven filter buttons: **All Time, Q1, Q2, Q3, Q4, Monthly, Weekly**
- Active button: orange background; others: gray
- Monthly filter shows a dropdown to select a specific month
- Quarterly: Q1=Jan–Mar, Q2=Apr–Jun, Q3=Jul–Sep, Q4=Oct–Dec

### Data Aggregation Logic
| View | Behavior |
|---|---|
| Weekly | Raw data, labeled `W1`, `W2`, etc. |
| Monthly | Group by month+year, sum metrics, recalculate rates |
| Quarterly | Group by quarter+year, sum metrics, recalculate rates |
| Yearly | Group by year, sum all |

Lead source breakdown calculates totals per source: qualified, booked, closed, cash, and overall conversion rate.

### KPI Cards (4-grid)
1. **Total Revenue** — orange gradient, large card, `DollarSign` icon
2. **Avg Booking Rate** — with `Phone` icon
3. **Avg Conversion Rate** — with `CheckCircle` icon
4. **Total Closed Deals** — with `Target` icon

### Lead Source Analytics (2 cards)
1. Donut/Pie chart of closed deals by source
2. Funnel panel per source showing qualified → booked → closed + conversion %

**Source colors (never change these):**
- Inbound: `#FF6B35`
- Outbound: `#9B59B6`
- Referral: `#2ECC71`

### Charts Section
- **Toggle:** Weekly / Monthly / Quarterly / Yearly
- **Large chart (350px):** Revenue trend line chart with gradient fill
- **Small charts (180px each):**
  - Conversion Rates — dual line (booking % + conversion %)
  - Pipeline Activity — stacked bars (qualified + booked)
  - Closed Deals — single bar chart

**Chart label format:**
- Weekly: `W1`, `W2`, `W3`
- Monthly: `Jan '25`, `Feb '25`
- Quarterly: `Q1 '25`, `Q2 '25`
- Yearly: `'25`, `'26`

### AI Insights (`/api/ai/insights`)
- POST route — checks auth and active subscription before calling Anthropic
- Accepts: `metrics` array, `sourceBreakdown` object, `viewMode`
- Uses `claude-sonnet-4-20250514`, `max_tokens: 1500`
- Prompt requests exactly these sections:
  - `## PERFORMANCE SUMMARY`
  - `## KEY METRICS`
  - `## LEAD SOURCE ANALYSIS`
  - `## TRENDS & PATTERNS`
  - `## AREAS OF CONCERN`
  - `## TOP 3 RECOMMENDATIONS`
  - `## QUICK WINS`
- Parse response with regex per section, render each in a styled card

### Payments (Razorpay)
- `/api/razorpay/create-subscription` — creates a Razorpay subscription
- `/api/razorpay/verify-payment` — verifies HMAC SHA256 signature, updates subscription status to `active`
- **Never activate a subscription without verifying the signature first**

---

## Design System

### Colors
```
Primary accent:  #FF6B35  (orange)
Inbound source:  #FF6B35
Outbound source: #9B59B6
Referral source: #2ECC71

Light mode: bg=#FFFFFF, cards=bg-white / bg-slate-50
Dark mode:  bg=#000000, cards=bg-zinc-900 (#18181B)
```

### Typography
```
Font family: -apple-system, "SF Pro Display", "Segoe UI", Roboto, sans-serif
H1:    text-5xl font-semibold tracking-tight
H2:    text-2xl font-semibold
Body:  text-base font-normal
Label: text-sm font-medium
```

### Spacing & Borders
```
Card padding:    p-8
Section margin:  mb-8
Button padding:  px-6 py-3

Cards:   rounded-3xl (24px)
Buttons: rounded-full (primary), rounded-xl (secondary)
Inputs:  rounded-xl

Border light: border-slate-200
Border dark:  border-zinc-800
```

### Shadows
```
Cards:    shadow-xl
Buttons:  shadow-lg
Tooltips: box-shadow: 0 10px 40px rgba(0,0,0,0.1)
```

### Buttons
```
Primary:   bg-orange-500 text-white rounded-full px-6 py-3 font-medium hover:bg-orange-600 transition duration-300
Secondary: bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200
Danger:    bg-red-500 text-white
Disabled:  opacity-50
```

### Chart Styling (critical — never deviate)
- **No angled text** — all labels must be horizontal
- `axisLine={false}` on all axes
- `tickLine={false}` on all axes
- Grid: `strokeDasharray="3 3"`, `vertical={false}`
- Grid color: `#f1f5f9` (light) / `#27272a` (dark)
- Tooltip: `rounded-2xl`, custom shadow, no border, `backgroundColor` adapts to theme
- Bar corners: `radius={[6, 6, 0, 0]}`
- Primary line color: `#FF6B35`, `strokeWidth={3}`

---

## Header Design
```
Left:  "Hello, {UserName}" (text-5xl font-semibold)
       Random motivational quote (text-2xl font-light text-orange-500)

Right: Theme toggle | Logout | "Manage Data" | "+ Add Data"
```

Motivational quotes (rotate randomly):
- "Let's crush those numbers today"
- "Ready to make it happen"
- "Time to scale new heights"
- "Your success story starts here"
- "Let's turn data into growth"
- "Building momentum, one deal at a time"
- "Excellence is the standard"
- "Let's optimize for greatness"

---

## Data Entry Form (Modal or Slide-in)
Fields: Month (dropdown), Week (1–5), Year (2024–2026), Lead Source (**required**), Qualified Conversations, Booked Calls, Closed Deals, Cash Collected

- Show auto-calculated booking rate and conversion rate in real time as numbers are entered
- Save/Cancel buttons; support Edit mode (pre-populate form, update instead of insert)
- All fields required; show user-friendly validation errors

---

## Data Management Table
Columns: Week, Source (colored badge), Qualified, Booked, Closed, Cash, Actions (Edit/Delete)
- Hover effect on rows
- "Clear All Data" button — double confirmation before deleting

---

## Error Handling Conventions
- Red alert boxes (`bg-red-500 bg-opacity-10 border border-red-500`) for errors
- Loading states on all async operations
- Empty state when no data (center-aligned card with CTA)
- Network error fallbacks
- Subscription check on every protected API call

---

## Performance Guidelines
- Server-side render where possible (Next.js App Router)
- Lazy-load heavy chart components
- Memoize expensive aggregation calculations (`useMemo`)
- Debounce real-time rate calculations in the form
- Target: <200KB initial JS bundle

---

## Development Conventions

### Naming
- React components: PascalCase
- Functions/variables: camelCase
- Database columns: snake_case
- CSS classes: Tailwind utility-first

### State Management
- Local UI state: `useState`
- Expensive derived data: `useMemo`
- No external state library needed for this scope

### Dark Mode Pattern
```tsx
// Standard pattern used throughout
const bgClass = darkMode ? 'bg-black' : 'bg-white';
const textClass = darkMode ? 'text-white' : 'text-slate-900';
const textSecondary = darkMode ? 'text-slate-400' : 'text-slate-600';
const cardBg = darkMode ? 'bg-zinc-900' : 'bg-white';
const borderClass = darkMode ? 'border-zinc-800' : 'border-slate-200';
const hoverBg = darkMode ? 'hover:bg-zinc-800' : 'hover:bg-slate-50';
```

### Supabase Client Pattern
- Client-side: `createClientComponentClient()` from `@supabase/auth-helpers-nextjs`
- Server-side (API routes): `createClient(url, serviceRoleKey)` for admin operations

### Security
- Verify Razorpay HMAC SHA256 signature before activating any subscription
- Check `auth.uid()` in all Supabase RLS policies
- Never expose `SUPABASE_SERVICE_ROLE_KEY` or `RAZORPAY_KEY_SECRET` to the client
- Validate all form input on both client and server

---

## Critical Rules (Never Violate)

1. **Lead source is mandatory** — every `sales_metrics` row must have `lead_source`
2. **Auto-calculate rates** — never ask users to enter booking/conversion rates manually
3. **Subscription gate** — `/dashboard` and `/api/ai/insights` require an active subscription
4. **HMAC verification** — verify Razorpay payment signature before activating subscription
5. **Horizontal chart labels** — no angled or rotated text anywhere
6. **Dark mode everywhere** — all pages must support the dark/light toggle
7. **Funnel logic** — validate `qualified >= booked >= closed` before saving
8. **Division by zero** — always handle gracefully (return 0, not NaN or Infinity)

---

## File: `Vibe coded` (Original Prototype)

The root-level file `Vibe coded` is the original single-component React prototype. It demonstrates:
- All UI patterns (login, dashboard, form, charts, AI insights)
- The `window.storage` API used in the prototype platform
- State management approach and calculation logic

Use it as the source of truth for UI behavior and business logic when porting to the Next.js architecture. **Do not delete it** — it is the design reference.

---

## Git Workflow

- Feature branches: `claude/claude-md-mlshzczevdw4hxpt-376Pk`
- Commit messages: imperative mood, describe the "what" and "why"
- Push: `git push -u origin <branch-name>`
- Never push to `master` directly
