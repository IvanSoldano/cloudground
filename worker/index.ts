import { createClient } from '@supabase/supabase-js';

export interface Env {
  ASSETS: Fetcher;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  IS_LOCAL_DEV?: string;
}

// ---------------------------------------------------------------------------
// In-memory mock database for tasks
// Used as a fallback when Supabase credentials are not configured.
// Resets on Worker restart — perfect for local development without a real DB.
// ---------------------------------------------------------------------------
let mockTasks = [
  { id: '1', title: 'Design premium task interface (Backend)', completed: true,  created_at: new Date('2024-01-01').toISOString() },
  { id: '2', title: 'Integrate Angular signals (Backend)',      completed: true,  created_at: new Date('2024-01-02').toISOString() },
  { id: '3', title: 'Deploy to Cloudflare Workers (Backend)',  completed: false, created_at: new Date('2024-01-03').toISOString() },
  { id: '4', title: 'Add dark mode support (Backend)',         completed: false, created_at: new Date('2024-01-04').toISOString() },
];

/**
 * Returns a Supabase client when credentials are present in env,
 * or null to signal that the in-memory mock should be used instead.
 */
function tryGetSupabase(env: Env) {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) return null;
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // -------------------------------------------------------------------------
    // TASK API ROUTES
    // Each route tries Supabase first; falls back to in-memory mock when
    // SUPABASE_URL / SUPABASE_ANON_KEY are not set in the environment.
    // -------------------------------------------------------------------------
    if (url.pathname.startsWith('/api/tasks')) {
      const headers = { 'Content-Type': 'application/json' };
      const supabase = tryGetSupabase(env); // null → use mock

      // GET /api/tasks — return all tasks, newest first
      if (request.method === 'GET') {
        if (supabase) {
          const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false });
          if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
          return new Response(JSON.stringify(data), { headers });
        }
        // Mock: reverse so newest (highest index) comes first
        return new Response(JSON.stringify([...mockTasks].reverse()), { headers });
      }

      // POST /api/tasks — add a new task
      if (request.method === 'POST') {
        const body: any = await request.json();
        if (supabase) {
          const { data, error } = await supabase
            .from('tasks')
            .insert([{ title: body.title }])
            .select()
            .single();
          if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
          return new Response(JSON.stringify(data), { status: 201, headers });
        }
        const newTask = {
          id: crypto.randomUUID(),
          title: body.title,
          completed: false,
          created_at: new Date().toISOString(),
        };
        mockTasks = [newTask, ...mockTasks];
        return new Response(JSON.stringify(newTask), { status: 201, headers });
      }

      // PUT /api/tasks/:id — toggle completed
      if (request.method === 'PUT') {
        const id = url.pathname.split('/').pop();
        if (supabase) {
          const { data: existing, error: fetchErr } = await supabase
            .from('tasks').select('completed').eq('id', id).single();
          if (fetchErr) return new Response(JSON.stringify({ error: fetchErr.message }), { status: 500, headers });
          const { data, error } = await supabase
            .from('tasks')
            .update({ completed: !existing.completed })
            .eq('id', id)
            .select()
            .single();
          if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
          return new Response(JSON.stringify(data), { headers });
        }
        let updated: (typeof mockTasks)[0] | undefined;
        mockTasks = mockTasks.map((t) => {
          if (t.id !== id) return t;
          updated = { ...t, completed: !t.completed };
          return updated;
        });
        return new Response(JSON.stringify(updated ?? { success: true }), { headers });
      }

      // DELETE /api/tasks/:id — remove a task
      if (request.method === 'DELETE') {
        const id = url.pathname.split('/').pop();
        if (supabase) {
          const { error } = await supabase.from('tasks').delete().eq('id', id);
          if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
          return new Response(JSON.stringify({ success: true }), { headers });
        }
        mockTasks = mockTasks.filter((t) => t.id !== id);
        return new Response(JSON.stringify({ success: true }), { headers });
      }
    }

    // Existing API Route
    if (url.pathname.startsWith('/api/data')) {
      return new Response(
        JSON.stringify({
          message: 'Hello from Cloudflare Worker!',
          timestamp: new Date().toISOString(),
          supabaseUrl: env.SUPABASE_URL || 'No URL provided (using mock)',
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Proxy to Angular dev server during local development
    if (env.IS_LOCAL_DEV === 'true') {
      const proxyUrl = new URL(request.url);
      proxyUrl.host = 'localhost:4200';
      proxyUrl.protocol = 'http:';

      try {
        const response = await fetch(new Request(proxyUrl.toString(), request));
        return response;
      } catch (e) {
        console.error('Proxy failed (is Angular dev server running?), falling back to assets', e);
      }
    }

    // Fallback to static assets (production behavior)
    return env.ASSETS.fetch(request);
  },
};
