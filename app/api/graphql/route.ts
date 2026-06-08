// app/api/graphql/route.ts
// This is the single GraphQL endpoint for the entire app.
// Apollo Server handles all queries (read) and mutations (write).

import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken, verifyToken } from "@/lib/auth";

// ─── GraphQL Schema (Type Definitions) ───────────────────────────────────────
const typeDefs = `#graphql
  type User {
    id: Int!
    email: String!
  }

  type Student {
    id: Int!
    fullName: String!
    email: String!
    department: String!
    academicYear: Int!
    profilePic: String
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    # Returns all students (requires auth token in header)
    students: [Student!]!
    # Returns a single student by id
    student(id: Int!): Student
  }

  type Mutation {
    # Register a new admin/user account
    register(email: String!, password: String!): AuthPayload!
    # Login and receive a JWT token
    login(email: String!, password: String!): AuthPayload!

    # Create a new student profile
    createStudent(
      fullName: String!
      email: String!
      department: String!
      academicYear: Int!
      profilePic: String
    ): Student!

    # Update an existing student
    updateStudent(
      id: Int!
      fullName: String
      email: String
      department: String
      academicYear: Int
      profilePic: String
    ): Student!

    # Delete a student by id
    deleteStudent(id: Int!): Boolean!
  }
`;

// ─── Context type (request carries the JWT) ──────────────────────────────────
interface Context {
  userId: number | null;
}

// ─── Resolvers ────────────────────────────────────────────────────────────────
const resolvers = {
  Query: {
    // Get all students — protected: must be logged in
    students: (_: unknown, __: unknown, ctx: Context) => {
      if (!ctx.userId) throw new Error("Not authenticated");
      return prisma.student.findMany({ orderBy: { createdAt: "desc" } });
    },

    // Get one student by id
    student: (_: unknown, { id }: { id: number }, ctx: Context) => {
      if (!ctx.userId) throw new Error("Not authenticated");
      return prisma.student.findUnique({ where: { id } });
    },
  },

  Mutation: {
    // Register a new user with hashed password
    register: async (_: unknown, { email, password }: { email: string; password: string }) => {
      const hashed = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({ data: { email, password: hashed } });
      const token = signToken({ userId: user.id, email: user.email });
      return { token, user };
    },

    // Login: verify credentials and return JWT
    login: async (_: unknown, { email, password }: { email: string; password: string }) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) throw new Error("Invalid credentials");
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new Error("Invalid credentials");
      const token = signToken({ userId: user.id, email: user.email });
      return { token, user };
    },

    // Create student — protected
    createStudent: (_: unknown, args: { fullName: string; email: string; department: string; academicYear: number; profilePic?: string }, ctx: Context) => {
      if (!ctx.userId) throw new Error("Not authenticated");
      return prisma.student.create({ data: args });
    },

    // Update student fields — protected
    updateStudent: (_: unknown, { id, ...data }: { id: number; fullName?: string; email?: string; department?: string; academicYear?: number; profilePic?: string }, ctx: Context) => {
      if (!ctx.userId) throw new Error("Not authenticated");
      return prisma.student.update({ where: { id }, data });
    },

    // Delete student — protected
    deleteStudent: async (_: unknown, { id }: { id: number }, ctx: Context) => {
      if (!ctx.userId) throw new Error("Not authenticated");
      await prisma.student.delete({ where: { id } });
      return true;
    },
  },
};

// ─── Apollo Server Setup ──────────────────────────────────────────────────────
const server = new ApolloServer<Context>({ typeDefs, resolvers });

const handler = startServerAndCreateNextHandler<NextRequest, Context>(server, {
  // Extract JWT from Authorization header and set userId in context
  context: async (req) => {
    const auth = req.headers.get("authorization") ?? "";
    const token = auth.replace("Bearer ", "");
    const payload = token ? verifyToken(token) : null;
    return { userId: payload?.userId ?? null };
  },
});

// Next.js App Router exports GET and POST handlers
export { handler as GET, handler as POST };
