import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions"; // Ensure the correct path to authOptions

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
