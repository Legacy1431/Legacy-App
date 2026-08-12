# Legacy Compliance Dashboard

A private trucking-compliance tracker for Legacy Business Services LLC — client
setup checklists, plus Monthly / Quarterly / Yearly compliance, all tracked
per client with automatic due dates.

This is a real, standalone app (Next.js + Supabase). It is **not connected to
anything yet** — you need to create your own free Supabase project and Vercel
account, which takes about 15 minutes the first time. Everything below is
written for someone doing this for the first time.

## What this is built with
- **Next.js** — the app itself (runs on Vercel, free tier is plenty for this).
- **Supabase** — the database and login system (also free tier to start).

You will end up with your own private URL (e.g. `legacy-compliance.vercel.app`,
or a custom domain later) that only you and whoever you add can sign into.

## What's tracked
Each client can have any mix of **services** turned on — Trucking Compliance,
Bookkeeping, Payroll, WA Excise Tax — set on their profile. Whichever are
checked determines their setup checklist and which Monthly/Quarterly/Yearly
items apply to them. A restaurant client with just Bookkeeping + Payroll sees
none of the trucking items; a trucking client can also have Bookkeeping and
Payroll turned on if you do that work for them too. **Other Tasks** is a
freeform list per client for anything one-off that doesn't fit a template.

## 1. Create your Supabase project (database + login)
1. Go to supabase.com and sign up (free).
2. Create a new project. Pick any name/region; save the database password it
   generates somewhere safe (a password manager).
3. Once it's ready, go to the **SQL Editor** (left sidebar) → New query.
4. Open `supabase/schema.sql` from this project, paste its entire contents in,
   and click **Run**. This creates all the tables, security rules, and loads
   your three real clients (Blue Horse, Skyline, White Trans).

   **Already deployed this before and have real data in it?** Don't re-run
   schema.sql — instead run `supabase/migrations/002_add_services_and_tasks.sql`
   the same way. It only adds the new columns/tables and leaves everything
   you've entered untouched.
5. Go to **Settings → API**. Copy the **Project URL** and the **anon public**
   key — you'll need both in step 3 below.

## 2. Put the code on GitHub
1. Create a free GitHub account if you don't have one.
2. Create a new repository (e.g. `legacy-compliance-app`).
3. Upload this whole folder to it (GitHub's web uploader works, or ask
   whoever is helping you deploy to push it with git).

## 3. Deploy to Vercel
1. Go to vercel.com and sign up with your GitHub account (free).
2. Click **Add New → Project**, choose the repository you just created.
3. Before clicking Deploy, open **Environment Variables** and add:
   - `NEXT_PUBLIC_SUPABASE_URL` = the Project URL from step 1.5
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = the anon public key from step 1.5
4. Click **Deploy**. In about a minute you'll get a live URL.

## 4. Sign in and add yourself as a team member
The database is locked down so only approved people can see your data — even
you, the first time, until you're added.
1. Open your new Vercel URL. Click "Need an account? Sign up", enter your
   email and a password.
2. Check your email and confirm the account (Supabase sends this automatically).
3. Back in Supabase: **SQL Editor → New query**, run:
   ```sql
   select id, email from auth.users;
   ```
4. Find your email in the results, copy its `id`.
5. Run (replacing the id):
   ```sql
   insert into team_members (user_id, display_name) values ('paste-id-here', 'Harleen');
   ```
6. Refresh your app and sign in — you're in.

## Adding a team member later
Have them sign up on your live URL the same way (step 4.1–4.2), then repeat
step 4.3–4.5 with their id and name. That's the entire process — no extra
cost, no separate accounts to manage.

## Custom domain (optional)
In Vercel: **Project → Settings → Domains**, add something like
`compliance.thelegacyservice.com` and follow the DNS instructions it gives you
(a couple of records added wherever thelegacyservice.com is registered).

## Local development
```
npm install
cp .env.example .env.local   # then fill in your real Supabase values
npm run dev
```

## Cost
Both Supabase and Vercel free tiers comfortably cover a solo/small-team
practice like this. If you ever outgrow them, each is roughly $25/month for
the next tier up — you'd get an email warning first.

## If something needs fixing later
Hand this whole folder (or the GitHub repo) to Claude Code and describe what
you want changed — it can edit the code, test it, and redeploy it with you
directly, including creating the GitHub repo and connecting Vercel if you
haven't done that part yet.
