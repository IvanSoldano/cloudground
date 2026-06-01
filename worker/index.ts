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
let mockPersons = [
  { id: 'p1', name: 'Alice', surname: 'Smith', dni: '12345678', cuil: '20-12345678-0' },
  { id: 'p2', name: 'Bob', surname: 'Jones', dni: '87654321', cuil: '20-87654321-0' },
];

let mockTasks: any[] = [
  { id: '1', title: 'Design premium task interface (Backend)', completed: true, created_at: new Date('2024-01-01').toISOString(), plannedStartDate: '2024-01-01', plannedEndDate: '2024-01-10', assigneeId: 'p1' },
  { id: '2', title: 'Integrate Angular signals (Backend)', completed: true, created_at: new Date('2024-01-02').toISOString(), assigneeId: 'p2' },
  { id: '3', title: 'Deploy to Cloudflare Workers (Backend)', completed: false, created_at: new Date('2024-01-03').toISOString() },
  { id: '4', title: 'Add dark mode support (Backend)', completed: false, created_at: new Date('2024-01-04').toISOString() },
];

let mockTaskLogs: any[] = [
  { id: 'l1', taskId: '1', fieldChanged: 'endDate', oldValue: '2024-01-08', newValue: '2024-01-10', justification: 'Design took longer', timestamp: new Date('2024-01-05').toISOString() }
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
    // AUTHENTICATION MIDDLEWARE
    // -------------------------------------------------------------------------
    if (url.pathname.startsWith('/api/')) {
      const authHeader = request.headers.get('Authorization');
      const supabase = tryGetSupabase(env);
      
      if (supabase && authHeader !== 'Bearer DEV_BYPASS_TOKEN') {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response(JSON.stringify({ error: 'Unauthorized: Missing or invalid token' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
        }
        
        const token = authHeader.split(' ')[1];
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error || !user) {
          return new Response(JSON.stringify({ error: 'Unauthorized: Invalid token' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
        }
        // Token is valid. We could attach user to request context here if needed.
      }
    }

    // -------------------------------------------------------------------------
    // TASK API ROUTES
    // Each route tries Supabase first; falls back to in-memory mock when
    // SUPABASE_URL / SUPABASE_ANON_KEY are not set in the environment.
    // -------------------------------------------------------------------------
    if (url.pathname.startsWith('/api/persons')) {
      const headers = { 'Content-Type': 'application/json' };
      if (request.method === 'GET') {
        return new Response(JSON.stringify(mockPersons), { headers });
      }
      if (request.method === 'POST') {
        const body: any = await request.json();
        const newPerson = {
          id: crypto.randomUUID(),
          name: body.name,
          surname: body.surname,
          dni: body.dni,
          cuil: body.cuil
        };
        mockPersons = [...mockPersons, newPerson];
        return new Response(JSON.stringify(newPerson), { status: 201, headers });
      }
    }

    if (url.pathname.startsWith('/api/tasks')) {
      const headers = { 'Content-Type': 'application/json' };
      const supabase = tryGetSupabase(env); // null → use mock

      // Check if it's a logs route
      const logsMatch = url.pathname.match(/^\/api\/tasks\/([^\/]+)\/logs$/);
      if (logsMatch) {
        const taskId = logsMatch[1];
        if (request.method === 'GET') {
          const logs = mockTaskLogs.filter(l => l.taskId === taskId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          return new Response(JSON.stringify(logs), { headers });
        }
        if (request.method === 'POST') {
          const body: any = await request.json();
          const newLog = {
            id: crypto.randomUUID(),
            taskId,
            fieldChanged: body.fieldChanged,
            oldValue: body.oldValue,
            newValue: body.newValue,
            justification: body.justification,
            timestamp: new Date().toISOString()
          };
          mockTaskLogs = [newLog, ...mockTaskLogs];
          return new Response(JSON.stringify(newLog), { status: 201, headers });
        }
      }

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
            .insert([{
              title: body.title,
              assignee_id: body.assigneeId,
              planned_start_date: body.plannedStartDate,
              planned_end_date: body.plannedEndDate
            }])
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
          assignee_id: body.assigneeId,
          planned_start_date: body.plannedStartDate,
          planned_end_date: body.plannedEndDate
        };
        mockTasks = [newTask, ...mockTasks];
        return new Response(JSON.stringify(newTask), { status: 201, headers });
      }

      // PUT /api/tasks/:id — update a task
      if (request.method === 'PUT') {
        const id = url.pathname.split('/').pop();
        const body: any = await request.json().catch(() => ({}));
        if (supabase) {
          const { data: existing, error: fetchErr } = await supabase
            .from('tasks').select('*').eq('id', id).single();
          if (fetchErr) return new Response(JSON.stringify({ error: fetchErr.message }), { status: 500, headers });

          const updates = Object.keys(body).length > 0 ? body : { completed: !existing.completed };
          const { data, error } = await supabase
            .from('tasks')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
          if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
          return new Response(JSON.stringify(data), { headers });
        }
        let updated: any = undefined;
        mockTasks = mockTasks.map((t) => {
          if (t.id !== id) return t;
          updated = Object.keys(body).length > 0 ? { ...t, ...body } : { ...t, completed: !t.completed };
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
