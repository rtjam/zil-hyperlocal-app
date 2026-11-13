# ZiL

A neighborhood sharing application built with Next.js, React, TypeScript, and Tailwind CSS, with Turkish and English interfaces.

## Run locally

Install Node.js 20 or later, then run:

```sh
npm ci
npm run dev
```

Open http://localhost:3000.

The application uses a local JSON database by default. It generates seed data automatically and stores changes in `data/zil-db.json`, which is excluded from version control.

## Configuration

Copy `.env.local.example` to `.env.local` and supply your own values to configure Supabase. Keep credentials out of version control. Database migrations are in `supabase/migrations`.

## Production

```sh
npm run build
npm start
```

See [DEPLOYMENT_AND_STORE_GUIDE.md](DEPLOYMENT_AND_STORE_GUIDE.md) for deployment and mobile packaging guidance, and [zil_app_blueprint_build_instructions.md](zil_app_blueprint_build_instructions.md) for the project blueprint.
