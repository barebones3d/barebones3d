interface PagesContext {
  request: Request;
  env: Record<string, any>;
  next: () => Promise<Response>;
}

export async function onRequest(context: PagesContext): Promise<Response> {
  const { request, next } = context;
  const url = new URL(request.url);

  // 1. Permanent redirect www to apex domain
  if (url.hostname.startsWith('www.')) {
    url.hostname = url.hostname.replace(/^www\./, '');
    return Response.redirect(url.toString(), 301);
  }

  // 2. Normalize accidental consecutive slashes in the path (e.g. //guides/ -> /guides/)
  if (url.pathname.includes('//')) {
    url.pathname = url.pathname.replace(/\/+/g, '/');
    return Response.redirect(url.toString(), 301);
  }

  const response = await next();

  // 3. For any /api/* endpoints, inject X-Robots-Tag: noindex, nofollow
  if (url.pathname.startsWith('/api/')) {
    const headers = new Headers(response.headers);
    headers.set('X-Robots-Tag', 'noindex, nofollow');
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }

  return response;
}
