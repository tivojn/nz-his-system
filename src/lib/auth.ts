import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const demoUsers = [
  { id: "1", email: "admin@nzhis.co.nz", name: "Dr. Sarah Mitchell", role: "Admin", department: "Administration" },
  { id: "2", email: "doctor@nzhis.co.nz", name: "Dr. James Henare", role: "Doctor", department: "General Medicine" },
  { id: "3", email: "nurse@nzhis.co.nz", name: "Aroha Williams", role: "Nurse", department: "Emergency" },
  { id: "4", email: "reception@nzhis.co.nz", name: "Mele Taufa", role: "Receptionist", department: "Front Desk" },
];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const user = demoUsers.find(u => u.email === credentials.email);
        if (!user) return null;
        
        // Accept "demo123" for all demo users
        if (credentials.password === "demo123") {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            department: user.department,
          };
        }
        
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.department = (user as any).department;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).department = token.department;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "nz-his-demo-secret-key-2026",
};
