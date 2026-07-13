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
let mockPeople = [
  { id: 'p1', name: 'Alex Rivera', email: 'alex@cloudground.io', role: 'Frontend Engineer', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
  { id: 'p2', name: 'Jordan Lee', email: 'jordan@cloudground.io', role: 'Backend Engineer', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
  { id: 'p3', name: 'Taylor Chen', email: 'taylor@cloudground.io', role: 'UI/UX Designer', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80' }
];

let mockTasks = [
  { id: '1', title: 'Design premium task interface (Backend)', completed: true,  created_at: new Date('2024-01-01').toISOString(), assigned_person_id: 'p3' },
  { id: '2', title: 'Integrate Angular signals (Backend)',      completed: true,  created_at: new Date('2024-01-02').toISOString(), assigned_person_id: 'p1' },
  { id: '3', title: 'Deploy to Cloudflare Workers (Backend)',  completed: false, created_at: new Date('2024-01-03').toISOString(), assigned_person_id: 'p2' },
  { id: '4', title: 'Add dark mode support (Backend)',         completed: false, created_at: new Date('2024-01-04').toISOString(), assigned_person_id: null },
];

let mockWikiPages = [
  {
    id: 'w1',
    slug: 'getting-started',
    title: 'Getting Started',
    content: '# Welcome to Cloudground Wiki\n\nThis is a custom wiki system built for **Cloudground**.\n\n## Features\n- Write in Markdown\n- Integrated with Supabase Auth\n- Keeps the last 2 versions automatically\n\nEnjoy editing!',
    author_id: 'p1',
    created_at: new Date('2024-01-05').toISOString(),
    updated_at: new Date('2024-01-05').toISOString(),
  }
];

let mockWikiHistory: any[] = [];


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
    // PEOPLE API ROUTES
    // -------------------------------------------------------------------------
    if (url.pathname.startsWith('/api/people')) {
      const headers = { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': '*'
      };
      
      if (request.method === 'OPTIONS') {
        return new Response(null, { headers });
      }

      const supabase = tryGetSupabase(env);

      // GET /api/people — list all people
      if (request.method === 'GET') {
        if (supabase) {
          try {
            const { data, error } = await supabase
              .from('people')
              .select('*')
              .order('created_at', { ascending: true });
            if (error) throw error;
            return new Response(JSON.stringify(data), { headers });
          } catch (err: any) {
            console.error('Supabase people fetch failed, falling back to mock:', err.message || err);
          }
        }
        return new Response(JSON.stringify(mockPeople), { headers });
      }

      // POST /api/people — create a new person
      if (request.method === 'POST') {
        const body: any = await request.json();
        if (supabase) {
          try {
            const { data, error } = await supabase
              .from('people')
              .insert([{ name: body.name, email: body.email, role: body.role, avatar_url: body.avatarUrl }])
              .select()
              .single();
            if (error) throw error;
            return new Response(JSON.stringify(data), { status: 201, headers });
          } catch (err: any) {
            console.error('Supabase people insert failed, falling back to mock:', err.message || err);
          }
        }
        const newPerson = {
          id: crypto.randomUUID(),
          name: body.name,
          email: body.email,
          role: body.role,
          avatar_url: body.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(body.name)}`,
          created_at: new Date().toISOString(),
        };
        mockPeople = [...mockPeople, newPerson];
        return new Response(JSON.stringify(newPerson), { status: 201, headers });
      }

      // DELETE /api/people/:id — remove a person
      if (request.method === 'DELETE') {
        const id = url.pathname.split('/').pop();
        if (supabase) {
          try {
            const { error } = await supabase.from('people').delete().eq('id', id);
            if (error) throw error;
            return new Response(JSON.stringify({ success: true }), { headers });
          } catch (err: any) {
            console.error('Supabase people delete failed, falling back to mock:', err.message || err);
          }
        }
        mockTasks = mockTasks.map(t => t.assigned_person_id === id ? { ...t, assigned_person_id: null } : t);
        mockPeople = mockPeople.filter((p) => p.id !== id);
        return new Response(JSON.stringify({ success: true }), { headers });
      }
    }

    // -------------------------------------------------------------------------
    // TASK API ROUTES
    // -------------------------------------------------------------------------
    if (url.pathname.startsWith('/api/tasks')) {
      const headers = { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': '*'
      };

      if (request.method === 'OPTIONS') {
        return new Response(null, { headers });
      }

      const supabase = tryGetSupabase(env); // null → use mock

      // GET /api/tasks — return all tasks, newest first
      if (request.method === 'GET') {
        if (supabase) {
          try {
            const { data, error } = await supabase
              .from('tasks')
              .select('*')
              .order('created_at', { ascending: false });
            if (error) throw error;
            return new Response(JSON.stringify(data), { headers });
          } catch (err: any) {
            console.error('Supabase tasks fetch failed, falling back to mock:', err.message || err);
          }
        }
        // Mock: reverse so newest (highest index) comes first
        return new Response(JSON.stringify([...mockTasks].reverse()), { headers });
      }

      // POST /api/tasks — add a new task
      if (request.method === 'POST') {
        const body: any = await request.json();
        if (supabase) {
          try {
            const { data, error } = await supabase
              .from('tasks')
              .insert([{ title: body.title, assigned_person_id: body.assignedPersonId }])
              .select()
              .single();
            if (error) throw error;
            return new Response(JSON.stringify(data), { status: 201, headers });
          } catch (err: any) {
            console.error('Supabase tasks insert failed, falling back to mock:', err.message || err);
          }
        }
        const newTask = {
          id: crypto.randomUUID(),
          title: body.title,
          completed: false,
          created_at: new Date().toISOString(),
          assigned_person_id: body.assignedPersonId || null,
        };
        mockTasks = [newTask, ...mockTasks];
        return new Response(JSON.stringify(newTask), { status: 201, headers });
      }

      // PUT /api/tasks/:id — update a task (toggle completed, assign person, etc.)
      if (request.method === 'PUT') {
        const id = url.pathname.split('/').pop();
        const body: any = await request.json().catch(() => ({}));
        
        if (supabase) {
          try {
            const updatePayload: any = {};
            if (body.completed !== undefined) {
              updatePayload.completed = body.completed;
            } else {
              const { data: existing, error: fetchErr } = await supabase
                .from('tasks').select('completed').eq('id', id).single();
              if (fetchErr) throw fetchErr;
              updatePayload.completed = !existing.completed;
            }

            if (body.assignedPersonId !== undefined) {
              updatePayload.assigned_person_id = body.assignedPersonId;
            }

            const { data, error } = await supabase
              .from('tasks')
              .update(updatePayload)
              .eq('id', id)
              .select()
              .single();
            if (error) throw error;
            return new Response(JSON.stringify(data), { headers });
          } catch (err: any) {
            console.error('Supabase tasks update failed, falling back to mock:', err.message || err);
          }
        }

        let updated: (typeof mockTasks)[0] | undefined;
        mockTasks = mockTasks.map((t) => {
          if (t.id !== id) return t;
          const completed = body.completed !== undefined ? body.completed : !t.completed;
          const assigned_person_id = body.assignedPersonId !== undefined ? body.assignedPersonId : t.assigned_person_id;
          updated = { ...t, completed, assigned_person_id };
          return updated;
        });
        return new Response(JSON.stringify(updated ?? { success: true }), { headers });
      }

      // DELETE /api/tasks/:id — remove a task
      if (request.method === 'DELETE') {
        const id = url.pathname.split('/').pop();
        if (supabase) {
          try {
            const { error } = await supabase.from('tasks').delete().eq('id', id);
            if (error) throw error;
            return new Response(JSON.stringify({ success: true }), { headers });
          } catch (err: any) {
            console.error('Supabase tasks delete failed, falling back to mock:', err.message || err);
          }
        }
        mockTasks = mockTasks.filter((t) => t.id !== id);
        return new Response(JSON.stringify({ success: true }), { headers });
      }
    }

    // -------------------------------------------------------------------------
    // WIKI API ROUTES
    // -------------------------------------------------------------------------
    if (url.pathname.startsWith('/api/wiki')) {
      const headers = { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': '*'
      };

      if (request.method === 'OPTIONS') {
        return new Response(null, { headers });
      }

      const supabase = tryGetSupabase(env);

      // GET /api/wiki — return all wiki pages (summaries without full content if desired, but we return all for now)
      if (request.method === 'GET' && url.pathname === '/api/wiki') {
        if (supabase) {
          try {
            const { data, error } = await supabase
              .from('wiki_pages')
              .select('id, slug, title, author_id, updated_at')
              .order('updated_at', { ascending: false });
            if (error) throw error;
            return new Response(JSON.stringify(data), { headers });
          } catch (err: any) {
            console.error('Supabase wiki fetch failed, falling back to mock:', err.message || err);
          }
        }
        const summaries = mockWikiPages.map(p => ({
          id: p.id, slug: p.slug, title: p.title, author_id: p.author_id, updated_at: p.updated_at
        }));
        return new Response(JSON.stringify(summaries), { headers });
      }

      // POST /api/wiki — create a new wiki page
      if (request.method === 'POST' && url.pathname === '/api/wiki') {
        const body: any = await request.json();
        
        // Ensure slug is clean
        const slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        if (supabase) {
          try {
            const { data, error } = await supabase
              .from('wiki_pages')
              .insert([{ title: body.title, slug, content: body.content, author_id: body.authorId }])
              .select()
              .single();
            if (error) throw error;
            return new Response(JSON.stringify(data), { status: 201, headers });
          } catch (err: any) {
            console.error('Supabase wiki insert failed, falling back to mock:', err.message || err);
          }
        }
        
        const newPage = {
          id: crypto.randomUUID(),
          slug,
          title: body.title,
          content: body.content,
          author_id: body.authorId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        mockWikiPages = [newPage, ...mockWikiPages];
        return new Response(JSON.stringify(newPage), { status: 201, headers });
      }

      // GET /api/wiki/:slug — return a specific wiki page with history
      const matchSlug = url.pathname.match(/^\/api\/wiki\/([^/]+)$/);
      if (request.method === 'GET' && matchSlug) {
        const slug = matchSlug[1];
        if (supabase) {
          try {
            // Fetch page
            const { data: page, error: pageErr } = await supabase
              .from('wiki_pages').select('*').eq('slug', slug).single();
            if (pageErr) throw pageErr;

            // Fetch history
            const { data: history, error: histErr } = await supabase
              .from('wiki_history').select('*').eq('page_id', page.id).order('created_at', { ascending: false });
            if (histErr) throw histErr;

            return new Response(JSON.stringify({ ...page, history }), { headers });
          } catch (err: any) {
            console.error('Supabase wiki fetch one failed, falling back to mock:', err.message || err);
          }
        }

        const page = mockWikiPages.find(p => p.slug === slug);
        if (!page) {
          return new Response(JSON.stringify({ error: 'Page not found' }), { status: 404, headers });
        }
        const history = mockWikiHistory.filter(h => h.page_id === page.id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return new Response(JSON.stringify({ ...page, history }), { headers });
      }

      // PUT /api/wiki/:slug — update a wiki page
      if (request.method === 'PUT' && matchSlug) {
        const slug = matchSlug[1];
        const body: any = await request.json();

        if (supabase) {
          try {
            // Note: Our Supabase Trigger handles saving the old content to history!
            const { data, error } = await supabase
              .from('wiki_pages')
              .update({ title: body.title, content: body.content, author_id: body.authorId })
              .eq('slug', slug)
              .select()
              .single();
            if (error) throw error;
            return new Response(JSON.stringify(data), { headers });
          } catch (err: any) {
            console.error('Supabase wiki update failed, falling back to mock:', err.message || err);
          }
        }

        const pageIndex = mockWikiPages.findIndex(p => p.slug === slug);
        if (pageIndex === -1) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers });
        
        const oldPage = mockWikiPages[pageIndex];
        
        // Mock Trigger logic: if content changed, save to history
        if (oldPage.content !== body.content) {
           mockWikiHistory.push({
             id: crypto.randomUUID(),
             page_id: oldPage.id,
             content: oldPage.content,
             author_id: oldPage.author_id,
             created_at: oldPage.updated_at
           });
           
           // Keep only last 2
           const pageHistory = mockWikiHistory.filter(h => h.page_id === oldPage.id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
           if (pageHistory.length > 2) {
              const toRemove = pageHistory.slice(2).map(h => h.id);
              mockWikiHistory = mockWikiHistory.filter(h => !toRemove.includes(h.id));
           }
        }

        mockWikiPages[pageIndex] = {
          ...oldPage,
          title: body.title || oldPage.title,
          content: body.content || oldPage.content,
          author_id: body.authorId || oldPage.author_id,
          updated_at: new Date().toISOString()
        };

        return new Response(JSON.stringify(mockWikiPages[pageIndex]), { headers });
      }
      
      // POST /api/wiki/:slug/restore/:historyId - restore a specific history state
      const matchRestore = url.pathname.match(/^\/api\/wiki\/([^/]+)\/restore\/([^/]+)$/);
      if (request.method === 'POST' && matchRestore) {
        const slug = matchRestore[1];
        const historyId = matchRestore[2];
        const body: any = await request.json(); // contains authorId restoring it

        if (supabase) {
          try {
            // 1. Get history item
            const { data: hist, error: histErr } = await supabase.from('wiki_history').select('*').eq('id', historyId).single();
            if (histErr) throw histErr;
            
            // 2. Update page content
            // Our DB trigger will automatically save the *current* state as a new history item before this update applies!
            const { data: page, error: pageErr } = await supabase.from('wiki_pages').update({
                content: hist.content,
                author_id: body.authorId
            }).eq('slug', slug).select().single();
            if (pageErr) throw pageErr;
            
            return new Response(JSON.stringify(page), { headers });
          } catch (err: any) {
             console.error('Supabase wiki restore failed, falling back to mock:', err.message || err);
          }
        }

        const pageIndex = mockWikiPages.findIndex(p => p.slug === slug);
        if (pageIndex === -1) return new Response(JSON.stringify({ error: 'Page not found' }), { status: 404, headers });
        const oldPage = mockWikiPages[pageIndex];
        const histItem = mockWikiHistory.find(h => h.id === historyId);
        if (!histItem) return new Response(JSON.stringify({ error: 'History not found' }), { status: 404, headers });

        // Mock Trigger logic: save current to history before restoring
        if (oldPage.content !== histItem.content) {
           mockWikiHistory.push({
             id: crypto.randomUUID(),
             page_id: oldPage.id,
             content: oldPage.content,
             author_id: oldPage.author_id,
             created_at: oldPage.updated_at
           });
           // Keep only last 2
           const pageHistory = mockWikiHistory.filter(h => h.page_id === oldPage.id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
           if (pageHistory.length > 2) {
              const toRemove = pageHistory.slice(2).map(h => h.id);
              mockWikiHistory = mockWikiHistory.filter(h => !toRemove.includes(h.id));
           }
        }

        mockWikiPages[pageIndex] = {
            ...oldPage,
            content: histItem.content,
            author_id: body.authorId || oldPage.author_id,
            updated_at: new Date().toISOString()
        };

        return new Response(JSON.stringify(mockWikiPages[pageIndex]), { headers });
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
