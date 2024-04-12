import { auth } from "@/auth";
import { NextResponse } from "next/server";
import crypto from 'crypto';

export default auth((req) => {
    if (!req.auth) {
        const schema: string = req.nextUrl.protocol;
        const host: string = req.nextUrl.host;

        return NextResponse.redirect(`${schema}//${host}/login`)
    }

    // Content Security Policy generation
    const nonce: string = Buffer.from(crypto.randomUUID()).toString('base64')

    const cspHeader: string = `
        default-src 'self';
        script-src 'self' 'strict-dynamic' 'unsafe-eval' 'nonce-${nonce}';
        script-src-elem 'self' 'unsafe-inline';
        style-src 'self' 'unsafe-inline' ;
        img-src 'self' data: blob:;
        font-src 'self';
        connect-src 'self' http://localhost:3001/ wss://localhost:3001/ ws://localhost:3001/;
        object-src 'none'; 
        frame-ancestors 'none';
        form-action 'self'; 
        upgrade-insecure-requests;
        base-uri 'self'
    `.replace(/\s{2,}/g, ' ').trim()


    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-nonce', nonce)
    requestHeaders.set('Content-Security-Policy', cspHeader)

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    }).headers.set('Content-Security-Policy', cspHeader)
});

export const config = {
    matcher: [
        {
            source: '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
            missing: [
                { type: 'header', key: 'next-router-prefetch' },
                { type: 'header', key: 'purpose', value: 'prefetch' },
            ],
        },
    ],
}
