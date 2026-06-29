import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

/** Routes that require waitlist sign-up before access. */
const GATED_PREFIXES = ['/app', '/whiteboard', '/rooms', '/mocktest-preview']

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Redirect gated routes to the waitlist
  if (GATED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix + '/'))) {
    const url = request.nextUrl.clone()
    url.pathname = '/waitlist'
    url.search = ''
    return NextResponse.redirect(url)
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Refresh session — do NOT remove this
  await supabase.auth.getUser()

  return supabaseResponse
}
