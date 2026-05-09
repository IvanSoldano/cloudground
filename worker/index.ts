export interface Env {
  ASSETS: Fetcher;
  SUPABASE_URL?: string;
  IS_LOCAL_DEV?: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // API Routes
    if (url.pathname.startsWith('/api/data')) {
      return new Response(
        JSON.stringify({
          message: "Hello from Cloudflare Worker!",
          timestamp: new Date().toISOString(),
          supabaseUrlMock: env.SUPABASE_URL || "No URL provided",
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Proxy to Angular dev server during local development
    if (env.IS_LOCAL_DEV === 'true') {
      const proxyUrl = new URL(request.url);
      proxyUrl.host = '127.0.0.1:4200';
      proxyUrl.protocol = 'http:';
      
      try {
        // Forward the request to the local Angular dev server
        const response = await fetch(new Request(proxyUrl.toString(), request));
        return response;
      } catch (e) {
        console.error("Proxy failed (is Angular dev server running?), falling back to assets", e);
      }
    }

    // Fallback to static assets (production behavior)
    return env.ASSETS.fetch(request);
  },
};
