import { NextResponse } from 'next/server'
import { NextRequest, userAgent } from 'next/server'
import jwt from 'jsonwebtoken'

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const roleToken = request.cookies.get('role_token')?.value



  const { device, os } = userAgent(request)

  if (request.nextUrl.pathname != '/' && device.type == 'mobile') {
    return NextResponse.redirect(new URL('/', request.url))
  }


  const loggedInUserNotAccessPaths = request.nextUrl.pathname === '/login' || request.nextUrl.pathname == '/'

  if (roleToken) {
    const decodedToken: any = jwt.decode(roleToken as string)
    if (decodedToken?.role.name == 'driver' && !request.nextUrl.pathname.includes(`/user/drivers/${decodedToken.role.driver_id}`)) {
      return NextResponse.redirect(new URL(`/user/drivers/${decodedToken.role.driver_id}`, request.url))
    }
  }

  if (loggedInUserNotAccessPaths) {
    if (token) {
      return NextResponse.redirect(new URL('/user/home', request.url))
    }
  } else {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  const newUpdateCount = request.cookies.get('updateVisit')
  const response = NextResponse.next()

  if (!newUpdateCount) {
    // If the cookie doesn't exist, create it and set it to 1
    response.cookies.set('updateVisit', '1', {
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    })
  }else{
    response.cookies.set('updateVisit','2')
  }

  return response
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/user/parties',
    '/user/:path',
    '/user/:path*',
    '/user/parties/:path/party-details',
    '/user/parties/:path/passbook',
    '/user/parties/:path/trips',
    '/user/:path',
    '/user/:path/:path',
    '/user/:path/:path/:path'
  ]
}
// See "Matching Paths" below to learn more
