import { NextRequest, NextResponse } from 'next/server'

const username = process.env.BETA_AUTH_USER
const password = process.env.BETA_AUTH_PASS
const realm = 'Funding Intelligence Beta'

function unauthorizedResponse() {
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': `Basic realm="${realm}"`,
    },
  })
}

function decode(value: string) {
  try {
    return atob(value)
  } catch {
    return ''
  }
}

export function middleware(request: NextRequest) {
  if (!username || !password) {
    return NextResponse.next()
  }

  const basicAuth = request.headers.get('authorization')
  if (basicAuth) {
    const [, encoded] = basicAuth.split(' ')
    if (encoded) {
      const [user, pass] = decode(encoded).split(':')
      if (user === username && pass === password) {
        return NextResponse.next()
      }
    }
  }

  return unauthorizedResponse()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/health).*)'],
}
