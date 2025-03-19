import { NextResponse } from 'next/server';

export function middleware(request) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;
  
  // Skip middleware for RSC requests
  if (request.nextUrl.search?.includes('_rsc')) {
    console.log(`[Middleware] Skipping RSC request: ${path}${request.nextUrl.search}`);
    return NextResponse.next();
  }
  
  // Define public paths that don't require authentication
  const isPublicPath = path === '/login' || 
                       path.startsWith('/auth/callback') || 
                       path === '/' ||
                       path.includes('favicon') ||
                       path.includes('.png') ||
                       path.includes('.jpg') ||
                       path.includes('.svg');
  
  // Check if user is authenticated by looking for the authentication cookie
  const isAuthenticated = request.cookies.has('auth_token') || 
                          request.cookies.has('connect.sid') ||
                          request.cookies.has('token');
  
  console.log(`[Middleware] Path=${path}, Authenticated=${isAuthenticated}, Public=${isPublicPath}`);
  console.log(`[Middleware] Cookies:`, Array.from(request.cookies.getAll()).map(c => c.name));
  
  // Redirect authenticated users away from login page
  if (isAuthenticated && path === '/login') {
    console.log('[Middleware] Redirecting authenticated user from login to dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Redirect unauthenticated users to login page
  if (!isAuthenticated && !isPublicPath) {
    console.log('[Middleware] Redirecting unauthenticated user to login');
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  console.log('[Middleware] Allowing request to proceed');
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Match all routes except static files, api routes, and _next
    '/((?!_next/static|_next/image|_next/|favicon.ico|api).*)',
  ],
};
