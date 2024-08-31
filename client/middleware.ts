import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
// import { cookies } from 'next/headers'
 
// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
    console.log("middleware")
    const accessToken = request.cookies.get("accessToken")
    const refreshToken = request.cookies.get("refreshToken")
    if(accessToken || refreshToken){
        return NextResponse.next()
    }else{
        return NextResponse.redirect(new URL('/signin', request.url))
    }
}


export const config = {
  matcher: ['/', '/home', '/editor/:path*'],
}