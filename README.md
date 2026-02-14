This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Frontend + Backend (Nest)

Este frontend se comunica con el backend Nest vía `AUTH_BACKEND_URL`.

1) Levanta el backend en `http://localhost:3001` (ver `backend/.env.example`).
2) Crea tu archivo `.env.local` basado en `.env.example`.
3) Levanta el frontend con `npm run dev`.

### Auth (Credentials + Google OAuth)

Este proyecto usa `next-auth`.

1) Crea tu archivo `.env.local` basado en `.env.example`.

2) Para Google OAuth, configura en Google Cloud Console el **Authorized redirect URI**:

- `http://localhost:3000/api/auth/callback/google`

3) Levanta el proyecto con `npm run dev` y entra a `/unete` para ver el botón de Google.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
