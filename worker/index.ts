export interface Env {
  ASSETS: Fetcher;
  SUPABASE_URL?: string;
  IS_LOCAL_DEV?: string;
}

// In-memory mock database for tasks
// This will reset if the Worker restarts, but it's perfect for testing without a DB
let mockTasks = [
  { id: '1', title: 'Design premium task interface (Backend)', completed: true },
  { id: '2', title: 'Integrate Angular signals (Backend)', completed: true },
  { id: '3', title: 'Deploy to Cloudflare Workers (Backend)', completed: false },
  { id: '4', title: 'Add dark mode support (Backend)', completed: false },
];

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // --- TASK API ROUTES ---
    if (url.pathname.startsWith('/api/tasks')) {
      const headers = { "Content-Type": "application/json" };
      
      // GET: Return all tasks
      if (request.method === 'GET') {
        return new Response(JSON.stringify(mockTasks), { headers });
      }
      
      // POST: Add a new task
      if (request.method === 'POST') {
        const body: any = await request.json();
        const newTask = { id: crypto.randomUUID(), title: body.title, completed: false };
        mockTasks = [newTask, ...mockTasks]; // Add to beginning
        return new Response(JSON.stringify(newTask), { headers });
      }
      
      // PUT: Toggle task completion
      if (request.method === 'PUT') {
        const id = url.pathname.split('/').pop();
        mockTasks = mockTasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
        return new Response(JSON.stringify({ success: true }), { headers });
      }
      
      // DELETE: Remove a task
      if (request.method === 'DELETE') {
        const id = url.pathname.split('/').pop();
        mockTasks = mockTasks.filter(t => t.id !== id);
        return new Response(JSON.stringify({ success: true }), { headers });
      }
    }

    // Existing API Route
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
