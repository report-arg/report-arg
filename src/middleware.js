import { NextResponse } from "next/server";

import { getToken } from "next-auth/jwt";

export async function middleware(request) {
  const secret = process.env.NEXTAUTH_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.error("[SEGURIDAD CRÍTICA] NEXTAUTH_SECRET no está configurada en entorno de producción. Denegando acceso a rutas protegidas.");
      return new NextResponse(
        JSON.stringify({ error: "Configuración de seguridad del servidor inválida." }),
        { status: 500, headers: { "content-type": "application/json" } }
      );
    }
    console.warn("[SEGURIDAD] NEXTAUTH_SECRET no está configurada en el entorno.");
  }

  const token = await getToken({ req: request, secret });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verificación de rol para rutas de administración
  if (request.nextUrl.pathname.startsWith("/admin") && token.role !== "admin") {
    return NextResponse.redirect(new URL("/ciudadano", request.url));
  }

  // Verificación de rol para rutas de institución
  if (request.nextUrl.pathname.startsWith("/institucion") && token.role !== "institucion") {
    return NextResponse.redirect(new URL("/ciudadano", request.url));
  }

  // Redirigir a las instituciones que intenten entrar al feed ciudadano
  if (request.nextUrl.pathname.startsWith("/ciudadano") && token.role === "institucion") {
    return NextResponse.redirect(new URL("/institucion", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/institucion/:path*", "/ciudadano/:path*", "/profile"],
};