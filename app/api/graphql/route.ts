import { NextRequest, NextResponse } from "next/server";
import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { gql } from "graphql-tag";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const typeDefs = gql`
  type Todo {
    id: ID!
    task: String!
    completed: Boolean!
    priority: Int!
    description: String
    dueDate: String
    createdAt: String!
    updatedAt: String!
    tags: [String!]!
    assignedTo: String
    category: String
  }

  type Query {
    todos: [Todo!]!
  }

  type Mutation {
    addTodo(
      task: String!
      priority: Int
      description: String
      dueDate: String
      tags: [String!]
      assignedTo: String
      category: String
    ): Todo

    updateTodo(
      id: ID!
      task: String
      completed: Boolean
      priority: Int
      description: String
      dueDate: String
      tags: [String!]
      assignedTo: String
      category: String
    ): Todo

    deleteTodo(id: ID!): Boolean
  }
`;

const resolvers = {
  Query: {
    todos: async () => await prisma.todo.findMany(),
  },
  Mutation: {
    addTodo: async (
      _: any,
      {
        task,
        priority,
        description,
        dueDate,
        tags,
        assignedTo,
        category,
      }: {
        task: string;
        priority?: number;
        description?: string;
        dueDate?: string;
        tags?: string[];
        assignedTo?: string;
        category?: string;
      }
    ) => {
      return await prisma.todo.create({
        data: {
          task,
          priority: priority ?? 1,
          description: description ?? null,
          dueDate: dueDate ? new Date(dueDate) : null,
          tags: tags ?? [],
          assignedTo: assignedTo ?? null,
          category: category ?? null,
        },
      });
    },

    updateTodo: async (
      _: any,
      { id, ...updates }: { id: string; [key: string]: any }
    ) => {
      try {
        if (updates.dueDate) {
          updates.dueDate = new Date(updates.dueDate);
        }
        return await prisma.todo.update({
          where: { id },
          data: updates,
        });
      } catch (error) {
        throw new Error("Todo not found or update failed");
      }
    },

    deleteTodo: async (_: any, { id }: { id: string }) => {
      const todo = await prisma.todo.findUnique({ where: { id } });
      if (!todo) throw new Error("Todo not found");

      await prisma.todo.delete({ where: { id } });
      return true;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
const handler = startServerAndCreateNextHandler(server);

export async function POST(req: NextRequest) {
  return handler(req);
}
