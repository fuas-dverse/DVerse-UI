import NextAuth from "next-auth";
import Keycloak from "@auth/core/providers/keycloak";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Keycloak
    ],
    callbacks: {
        async redirect({ url, baseUrl }) {
            return baseUrl + "/chat";
        },
        async session({ session, token }) {
            return session;
        },
        async jwt({ token, user, account }) {
            return token;
        },
    },
    secret: process.env.AUTH_SECRET,
})