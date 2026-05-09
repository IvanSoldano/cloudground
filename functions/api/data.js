export async function onRequest(context) {
  // Contents of context include:
  // - request: The incoming Request object
  // - env: Environment variables / secrets
  // - params: Path parameters (if any)
  
  const env = context.env;
  
  // Return a mock JSON response simulating a database fetch
  return new Response(
    JSON.stringify({
      message: "Hello from Cloudflare Pages Function!",
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
