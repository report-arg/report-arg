/**
 * @jest-environment node
 */
import fs from 'fs';
import path from 'path';
import { middleware } from '@/middleware';
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(),
}));

describe('Seguridad y Manejo de Secretos (ADMIN-01 — Etapa 1)', () => {
  describe('1. Ausencia de secretos inseguros hardcodeados', () => {
    test('middleware.js no contiene cadenas de secretos inseguros ni fallbacks hardcodeados', () => {
      const middlewarePath = path.resolve(__dirname, '../src/middleware.js');
      const content = fs.readFileSync(middlewarePath, 'utf-8');

      expect(content).not.toContain('clave-secreta-desarrollo');
      expect(content).not.toMatch(/secret:\s*["'][^"']+["']/);
    });

    test('nextauth route.js no contiene claves de desarrollo hardcodeadas', () => {
      const routePath = path.resolve(__dirname, '../src/app/api/auth/[...nextauth]/route.js');
      const content = fs.readFileSync(routePath, 'utf-8');

      expect(content).not.toContain('clave-secreta-desarrollo');
      expect(content).not.toMatch(/secret:\s*["'][^"']+["']/);
    });
  });

  describe('2. Comportamiento seguro ante configuración ausente de NEXTAUTH_SECRET', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      jest.clearAllMocks();
      process.env = { ...originalEnv };
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    test('En entorno de producción, si NEXTAUTH_SECRET está ausente, el middleware deniega el acceso con 500', async () => {
      process.env.NODE_ENV = 'production';
      delete process.env.NEXTAUTH_SECRET;

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const req = {
        url: 'http://localhost:3000/admin/usuarios',
        nextUrl: { pathname: '/admin/usuarios' },
        headers: new Headers(),
      };

      const res = await middleware(req);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[SEGURIDAD CRÍTICA]')
      );
      expect(res.status).toBe(500);

      consoleErrorSpy.mockRestore();
    });

    test('Sin token de sesión, redirige al login con callbackUrl', async () => {
      process.env.NEXTAUTH_SECRET = 'secreto-de-prueba-seguro';
      getToken.mockResolvedValue(null);

      const req = {
        url: 'http://localhost:3000/admin/usuarios',
        nextUrl: { pathname: '/admin/usuarios' },
        headers: new Headers(),
      };

      const res = await middleware(req);

      expect(res.status).toBe(307); // NextResponse.redirect default
      expect(res.headers.get('location')).toContain('/login?callbackUrl=%2Fadmin%2Fusuarios');
    });

    test('Ciudadano intentando acceder a ruta /admin es redirigido a /ciudadano', async () => {
      process.env.NEXTAUTH_SECRET = 'secreto-de-prueba-seguro';
      getToken.mockResolvedValue({ role: 'ciudadano', id: '1' });

      const req = {
        url: 'http://localhost:3000/admin/usuarios',
        nextUrl: { pathname: '/admin/usuarios' },
        headers: new Headers(),
      };

      const res = await middleware(req);

      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toBe('http://localhost:3000/ciudadano');
    });

    test('Institución intentando acceder al feed ciudadano es redirigida a /institucion', async () => {
      process.env.NEXTAUTH_SECRET = 'secreto-de-prueba-seguro';
      getToken.mockResolvedValue({ role: 'institucion', id: '2' });

      const req = {
        url: 'http://localhost:3000/ciudadano',
        nextUrl: { pathname: '/ciudadano' },
        headers: new Headers(),
      };

      const res = await middleware(req);

      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toBe('http://localhost:3000/institucion');
    });

    test('Admin accediendo a ruta /admin es autorizado y continúa (NextResponse.next)', async () => {
      process.env.NEXTAUTH_SECRET = 'secreto-de-prueba-seguro';
      getToken.mockResolvedValue({ role: 'admin', id: '3' });

      const req = {
        url: 'http://localhost:3000/admin/usuarios',
        nextUrl: { pathname: '/admin/usuarios' },
        headers: new Headers(),
      };

      const res = await middleware(req);

      expect(res.status).toBe(200); // NextResponse.next()
    });
  });
});
