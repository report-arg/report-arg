import { NextResponse } from "next/server";
import { RUTAS_PROTEGIDAS } from "@/lib/roles";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Lee el rol desde la cookie (la setea el login)
  const rol = request.cookies.get("rol")?.value ?? null;

  // Verifica si la ruta está protegida
  const rolesPermitidos = RUTAS_PROTEGIDAS[pathname];

  // Si la ruta es pública, dejamos pasar
  if (!rolesPermitidos) {
    return NextResponse.next();
  }

  // Si no hay usuario logueado, redirige al login
  if (!rol) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Si el rol no tiene permiso para esa ruta, redirige
  if (!rolesPermitidos.includes(rol)) {
    return NextResponse.redirect(new URL("/sin-permiso", request.url));
  }

  // Todo ok, dejar pasar
  return NextResponse.next();
}

// Qué rutas intercepta el middleware
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/reclamos/:path*",
    "/comunicados/:path*",
    "/eventos/:path*",
    "/admin/:path*",
  ],
};