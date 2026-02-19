"use server";
import {
  createClient,
  executeRequest,
  listTools,
  removeClient,
} from "./client";
import { MCPClientLogger } from "./logger";
import {
  DEFAULT_MCP_CONFIG,
  McpClientData,
  McpConfigData,
  McpRequestMessage,
  ServerConfig,
  ServerStatusResponse,
} from "./types";
import fs from "fs/promises";
import path from "path";
import { getServerSideConfig } from "../config/server";

const logger = new MCPClientLogger("MCP Actions");
const CONFIG_PATH = path.join(process.cwd(), "app/mcp/mcp_config.json");

const clientsMap = new Map<string, McpClientData>();

// Get client status
export async function getClientsStatus(): Promise<
  Record<string, ServerStatusResponse>
> {
  const config = await getMcpConfigFromFile();
  const result: Record<string, ServerStatusResponse> = {};

  for (const clientId of Object.keys(config.mcpServers)) {
    const status = clientsMap.get(clientId);
    const serverConfig = config.mcpServers[clientId];

    if (!serverConfig) {
      result[clientId] = { status: "undefined", errorMsg: null };
      continue;
    }

    if (serverConfig.status === "paused") {
      result[clientId] = { status: "paused", errorMsg: null };
      continue;
    }

    if (!status) {
      result[clientId] = { status: "undefined", errorMsg: null };
      continue;
    }

    if (
      status.client === null &&
      status.tools === null &&
      status.errorMsg === null
    ) {
      result[clientId] = { status: "initializing", errorMsg: null };
      continue;
    }

    if (status.errorMsg) {
      result[clientId] = { status: "error", errorMsg: status.errorMsg };
      continue;
    }

    if (status.client) {
      result[clientId] = { status: "active", errorMsg: null };
      continue;
    }

    result[clientId] = { status: "error", errorMsg: "Client not found" };
  }

  return result;
}

// Get client tools
export async function getClientTools(clientId: string) {
  return clientsMap.get(clientId)?.tools ?? null;
}

// Get available client count
export async function getAvailableClientsCount() {
  let count = 0;
  clientsMap.forEach((map) => !map.errorMsg && count++);
  return count;
}

// Get all client tools
export async function getAllTools() {
  const result = [];
  for (const [clientId, status] of clientsMap.entries()) {
    result.push({
      clientId,
      tools: status.tools,
    });
  }
  return result;
}

// Initialize a single client
async function initializeSingleClient(
  clientId: string,
  serverConfig: ServerConfig,
) {
  // Do not initialize if the server is paused
  if (serverConfig.status === "paused") {
    logger.info(`Skipping initialization for paused client [${clientId}]`);
    return;
  }

  logger.info(`Initializing client [${clientId}]...`);

  // Set initializing status first
  clientsMap.set(clientId, {
    client: null,
    tools: null,
    errorMsg: null, // null means initializing
  });

  // Initialize asynchronously
  createClient(clientId, serverConfig)
    .then(async (client) => {
      const tools = await listTools(client);
      logger.info(
        `Supported tools for [${clientId}]: ${JSON.stringify(tools, null, 2)}`,
      );
      clientsMap.set(clientId, { client, tools, errorMsg: null });
      logger.success(`Client [${clientId}] initialized successfully`);
    })
    .catch((error) => {
      clientsMap.set(clientId, {
        client: null,
        tools: null,
        errorMsg: error instanceof Error ? error.message : String(error),
      });
      logger.error(`Failed to initialize client [${clientId}]: ${error}`);
    });
}

// Initialize system
export async function initializeMcpSystem() {
  logger.info("MCP Actions starting...");
  try {
    // Check whether active clients already exist
    if (clientsMap.size > 0) {
      logger.info("MCP system already initialized, skipping...");
      return;
    }

    const config = await getMcpConfigFromFile();
    // Initialize all clients
    for (const [clientId, serverConfig] of Object.entries(config.mcpServers)) {
      await initializeSingleClient(clientId, serverConfig);
    }
    return config;
  } catch (error) {
    logger.error(`Failed to initialize MCP system: ${error}`);
    throw error;
  }
}

// Add server
export async function addMcpServer(clientId: string, config: ServerConfig) {
  try {
    const currentConfig = await getMcpConfigFromFile();
    const isNewServer = !(clientId in currentConfig.mcpServers);

    // If this is a new server, set the default status to active
    if (isNewServer && !config.status) {
      config.status = "active";
    }

    const newConfig = {
      ...currentConfig,
      mcpServers: {
        ...currentConfig.mcpServers,
        [clientId]: config,
      },
    };
    await updateMcpConfig(newConfig);

    // Initialize only new servers or servers with active status
    if (isNewServer || config.status === "active") {
      await initializeSingleClient(clientId, config);
    }

    return newConfig;
  } catch (error) {
    logger.error(`Failed to add server [${clientId}]: ${error}`);
    throw error;
  }
}

// Pause server
export async function pauseMcpServer(clientId: string) {
  try {
    const currentConfig = await getMcpConfigFromFile();
    const serverConfig = currentConfig.mcpServers[clientId];
    if (!serverConfig) {
      throw new Error(`Server ${clientId} not found`);
    }

    // Update config first
    const newConfig: McpConfigData = {
      ...currentConfig,
      mcpServers: {
        ...currentConfig.mcpServers,
        [clientId]: {
          ...serverConfig,
          status: "paused",
        },
      },
    };
    await updateMcpConfig(newConfig);

    // Then close the client
    const client = clientsMap.get(clientId);
    if (client?.client) {
      await removeClient(client.client);
    }
    clientsMap.delete(clientId);

    return newConfig;
  } catch (error) {
    logger.error(`Failed to pause server [${clientId}]: ${error}`);
    throw error;
  }
}

// Resume server
export async function resumeMcpServer(clientId: string): Promise<void> {
  try {
    const currentConfig = await getMcpConfigFromFile();
    const serverConfig = currentConfig.mcpServers[clientId];
    if (!serverConfig) {
      throw new Error(`Server ${clientId} not found`);
    }

    // Try initializing the client first
    logger.info(`Trying to initialize client [${clientId}]...`);
    try {
      const client = await createClient(clientId, serverConfig);
      const tools = await listTools(client);
      clientsMap.set(clientId, { client, tools, errorMsg: null });
      logger.success(`Client [${clientId}] initialized successfully`);

      // Update config after successful initialization
      const newConfig: McpConfigData = {
        ...currentConfig,
        mcpServers: {
          ...currentConfig.mcpServers,
          [clientId]: {
            ...serverConfig,
            status: "active" as const,
          },
        },
      };
      await updateMcpConfig(newConfig);
    } catch (error) {
      const currentConfig = await getMcpConfigFromFile();
      const serverConfig = currentConfig.mcpServers[clientId];

      // If the server exists in config, update its status to error
      if (serverConfig) {
        serverConfig.status = "error";
        await updateMcpConfig(currentConfig);
      }

      // Initialization failed
      clientsMap.set(clientId, {
        client: null,
        tools: null,
        errorMsg: error instanceof Error ? error.message : String(error),
      });
      logger.error(`Failed to initialize client [${clientId}]: ${error}`);
      throw error;
    }
  } catch (error) {
    logger.error(`Failed to resume server [${clientId}]: ${error}`);
    throw error;
  }
}

// Remove server
export async function removeMcpServer(clientId: string) {
  try {
    const currentConfig = await getMcpConfigFromFile();
    const { [clientId]: _, ...rest } = currentConfig.mcpServers;
    const newConfig = {
      ...currentConfig,
      mcpServers: rest,
    };
    await updateMcpConfig(newConfig);

    // Close and remove client
    const client = clientsMap.get(clientId);
    if (client?.client) {
      await removeClient(client.client);
    }
    clientsMap.delete(clientId);

    return newConfig;
  } catch (error) {
    logger.error(`Failed to remove server [${clientId}]: ${error}`);
    throw error;
  }
}

// Restart all clients
export async function restartAllClients() {
  logger.info("Restarting all clients...");
  try {
    // Close all clients
    for (const client of clientsMap.values()) {
      if (client.client) {
        await removeClient(client.client);
      }
    }

    // Clear status
    clientsMap.clear();

    // Reinitialize
    const config = await getMcpConfigFromFile();
    for (const [clientId, serverConfig] of Object.entries(config.mcpServers)) {
      await initializeSingleClient(clientId, serverConfig);
    }
    return config;
  } catch (error) {
    logger.error(`Failed to restart clients: ${error}`);
    throw error;
  }
}

// Execute MCP request
export async function executeMcpAction(
  clientId: string,
  request: McpRequestMessage,
) {
}

// Get MCP config file
export async function getMcpConfigFromFile(): Promise<McpConfigData> {
  try {
    const configStr = await fs.readFile(CONFIG_PATH, "utf-8");
    return JSON.parse(configStr);
  } catch (error) {
    logger.error(`Failed to load MCP config, using default config: ${error}`);
    return DEFAULT_MCP_CONFIG;
  }
}

// Update MCP config file
async function updateMcpConfig(config: McpConfigData): Promise<void> {
  try {
    // Ensure the directory exists
    await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
    await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));
  } catch (error) {
    throw error;
  }
}

// Check whether MCP is enabled
export async function isMcpEnabled() {
  try {
    const serverConfig = getServerSideConfig();
    return serverConfig.enableMcp;
  } catch (error) {
    logger.error(`Failed to check MCP status: ${error}`);
    return false;
  }
}
