import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Simulación de llamada a tu backend real.
        // Aquí harías: const res = await apiClient.post('/login', credentials);
        // if (res.data.token) return res.data.user;
        
        // Mock provisorio
        if (credentials.email && credentials.password) {
          return { 
            id: "1", 
            name: "Usuario Demo", 
            email: credentials.email, 
            role: "CIUDADANO", 
            token: "mock-jwt-token" 
          };
        }
        return null;
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "mock-google-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "mock-google-secret",
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || "mock-facebook-id",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "mock-facebook-secret",
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.token; // Guardamos el JWT de nuestro backend real
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user.role = token.role;
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
