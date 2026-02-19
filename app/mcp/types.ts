// ref: https://spec.modelcontextprotocol.io/specification/basic/messages/

import { z } from "zod";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

export interface McpRequestMessage {
  jsonrpc?: "2.0";
  id?: string | number;
  method: "tools/call" | string;
  params?: {
    [key: string]: unknown;
  };
}

export const McpRequestMessageSchema: z.ZodType<McpRequestMessage> = z.object({
  jsonrpc: z.literal("2.0").optional(),
  id: z.union([z.string(), z.number()]).optional(),
  method: z.string(),
  params: z.record(z.unknown()).optional(),
});

export interface McpResponseMessage {
  jsonrpc?: "2.0";
  id?: string | number;
  result?: {
    [key: string]: unknown;
  };
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export const McpResponseMessageSchema: z.ZodType<McpResponseMessage> = z.object(
  {
    jsonrpc: z.literal("2.0").optional(),
    id: z.union([z.string(), z.number()]).optional(),
    result: z.record(z.unknown()).optional(),
    error: z
      .object({
        code: z.number(),
        message: z.string(),
        data: z.unknown().optional(),
      })
      .optional(),
  },
);

export interface McpNotifications {
  jsonrpc?: "2.0";
  method: string;
  params?: {
    [key: string]: unknown;
  };
}

export const McpNotificationsSchema: z.ZodType<McpNotifications> = z.object({
  jsonrpc: z.literal("2.0").optional(),
  method: z.string(),
  params: z.record(z.unknown()).optional(),
});

////////////
// Next Chat
////////////
export interface ListToolsResponse {
  tools: {
    name?: string;
    description?: string;
    inputSchema?: object;
    [key: string]: any;
  };
}

export type McpClientData =
  | McpActiveClient
  | McpErrorClient
  | McpInitializingClient;

interface McpInitializingClient {
  client: null;
  tools: null;
  errorMsg: null;
}

interface McpActiveClient {
  client: Client;
  tools: ListToolsResponse;
  errorMsg: null;
}

interface McpErrorClient {
  client: null;
  tools: null;
  errorMsg: string;
}

// Server status type
export type ServerStatus =
  | "undefined"
  | "active"
  | "paused"
  | "error"
  | "initializing";

export interface ServerStatusResponse {
  status: ServerStatus;
  errorMsg: string | null;
}

// Types related to MCP server configuration
export interface ServerConfig {
  command: string;
  args: string[];
  env?: Record<string, string>;
  status?: "active" | "paused" | "error";
}

export interface McpConfigData {
  // MCP server configuration
  mcpServers: Record<string, ServerConfig>;
}

export const DEFAULT_MCP_CONFIG: McpConfigData = {
  mcpServers: {},
};

export interface ArgsMapping {
  // Parameter mapping type
  type: "spread" | "single" | "env";

  // Parameter mapping position
  position?: number;

  // Parameter mapping key
  key?: string;
}

export interface PresetServer {
  // Unique MCP server identifier, used as the key in the final JSON config file
  id: string;

  // Display name of the MCP server
  name: string;

  // Description of the MCP server
  description: string;

  // Repository URL of the MCP server
  repo: string;

  // Tags of the MCP server
  tags: string[];

  // Command of the MCP server
  command: string;

  // Arguments of the MCP server
  baseArgs: string[];

  // Whether the MCP server requires configuration
  configurable: boolean;

  // MCP server configuration schema
  configSchema?: {
    properties: Record<
      string,
      {
        type: string;
        description?: string;
        required?: boolean;
        minItems?: number;
      }
    >;
  };

  // Argument mapping of the MCP server
  argsMapping?: Record<string, ArgsMapping>;
}
