# cloudground

Testing cloud infrastructure services. Starting with Cloudflare.

## Local Development (Wrangler + Angular)

To run both the Angular development server and the Cloudflare Pages (Wrangler) local proxy simultaneously, execute:

```cmd
npm run dev:cloudflare
```

Navigate to `http://localhost:8788` to see the application. The frontend automatically fetches from the Cloudflare local proxy backend (`/functions/api`).

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 21.2.10.
