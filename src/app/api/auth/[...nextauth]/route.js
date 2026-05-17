import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Credenciales inválidas');
        }

        return {
          id: String(data.user.id),
          email: data.user.email,
          role: data.user.role,
          name: data.user.nombre || data.user.email,
          foto: data.user.foto || null,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        };
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "mock-google-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "mock-google-secret",
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || "mock-facebook-id",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "mock-facebook-secret",
      authorization: {
        params: {
          scope: "public_profile",
        },
      },
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!account || account.provider === 'credentials') {
        return true;
      }

      const resolvedEmail = user.email || `${account.provider}-${account.providerAccountId}@reportarg.social`;

      const response = await fetch(`${API_URL}/api/auth/social-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resolvedEmail,
          name: user.name,
          provider: account.provider,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'No se pudo iniciar sesión con el proveedor externo');
      }

      user.id = String(data.user.id);
      user.email = data.user.email || resolvedEmail;
      user.role = data.user.role;
      user.accessToken = data.accessToken;
      user.refreshToken = data.refreshToken;

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.role = user.role;
        token.userId = user.id;
        token.name = user.name || token.name;
        token.email = user.email || token.email;
        token.foto = user.foto || token.foto || null;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.user.id = token.userId;
      session.user.role = token.role;
      session.user.name = token.name || session.user.name;
      session.user.email = token.email || session.user.email;
      session.user.foto = token.foto || null;
      return session;
    }
  },
  pages: {
    signIn: '/login', // Indicamos cuál es nuestra pantalla visual de login
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "clave-secreta-desarrollo",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
