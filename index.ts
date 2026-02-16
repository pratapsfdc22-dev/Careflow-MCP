#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance, AxiosError } from 'axios';
import dotenv from 'dotenv';
import {
  EnvConfigSchema,
  TriggerWorkflowInputSchema,
  GetWorkflowStatusInputSchema,
  CreatePatientTaskInputSchema,
  N8nApiError,
  ValidationError,
  ConfigurationError,
  type Workflow,
  type Execution,
  type EnvConfig,
} from './types.js';

// Load environment variables
dotenv.config();

/**
 * N8nWorkflowMcpServer - Production-ready MCP server for n8n workflows
 */
class N8nWorkflowMcpServer {
  private server: Server;
  private axiosInstance: AxiosInstance;
  private config: EnvConfig;

  constructor() {
    // Validate environment configuration
    this.config = this.validateConfig();

    // Initialize axios instance with n8n API configuration
    this.axiosInstance = axios.create({
      baseURL: this.config.N8N_BASE_URL,
      headers: {
        'X-N8N-API-KEY': this.config.N8N_API_KEY,
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout
    });

    // Initialize MCP server
    this.server = new Server(
      {
        name: 'n8n-workflow-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.setupErrorHandling();
  }

  /**
   * Validate environment configuration using Zod
   */
  private validateConfig(): EnvConfig {
    try {
      return EnvConfigSchema.parse({
        N8N_BASE_URL: process.env.N8N_BASE_URL,
        N8N_API_KEY: process.env.N8N_API_KEY,
        N8N_WEBHOOK_SECRET: process.env.N8N_WEBHOOK_SECRET,
      });
    } catch (error: any) {
      throw new ConfigurationError(
        `Invalid configuration: ${error.errors?.map((e: any) => e.message).join(', ')}`
      );
    }
  }

  /**
   * Setup MCP server request handlers
   */
  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'trigger_workflow',
          description:
            'Triggers an n8n webhook workflow by name and passes a JSON payload. Returns execution ID or response data.',
          inputSchema: {
            type: 'object',
            properties: {
              workflowName: {
                type: 'string',
                description: 'Name of the n8n workflow to trigger',
              },
              payload: {
                type: 'object',
                description: 'JSON payload to send to the workflow webhook',
                default: {},
              },
            },
            required: ['workflowName'],
          },
        },
        {
          name: 'list_workflows',
          description:
            'Lists all active workflows from n8n REST API. Returns workflow IDs, names, and metadata.',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_workflow_status',
          description:
            'Checks execution status of a workflow run by execution ID. Returns status, timestamps, and result data.',
          inputSchema: {
            type: 'object',
            properties: {
              executionId: {
                type: 'string',
                description: 'The execution ID returned from trigger_workflow',
              },
            },
            required: ['executionId'],
          },
        },
        {
          name: 'create_patient_task',
          description:
            'Sends a structured patient task payload to a specified n8n workflow. Designed for healthcare workflows.',
          inputSchema: {
            type: 'object',
            properties: {
              workflowName: {
                type: 'string',
                description: 'Name of the n8n workflow to receive the task',
              },
              patientId: {
                type: 'string',
                description: 'Unique identifier for the patient',
              },
              taskType: {
                type: 'string',
                description: 'Type of task (e.g., "appointment", "medication", "followup")',
              },
              priority: {
                type: 'string',
                enum: ['low', 'medium', 'high', 'urgent'],
                description: 'Task priority level',
                default: 'medium',
              },
              description: {
                type: 'string',
                description: 'Detailed description of the task',
              },
              dueDate: {
                type: 'string',
                description: 'Due date in ISO 8601 format (YYYY-MM-DD)',
              },
              assignedTo: {
                type: 'string',
                description: 'User or team assigned to the task',
              },
              metadata: {
                type: 'object',
                description: 'Additional metadata for the task',
              },
            },
            required: ['workflowName', 'patientId', 'taskType'],
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'trigger_workflow':
            return await this.handleTriggerWorkflow(request.params.arguments);

          case 'list_workflows':
            return await this.handleListWorkflows();

          case 'get_workflow_status':
            return await this.handleGetWorkflowStatus(request.params.arguments);

          case 'create_patient_task':
            return await this.handleCreatePatientTask(request.params.arguments);

          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
        }
      } catch (error) {
        return this.handleToolError(error);
      }
    });
  }

  /**
   * Handle trigger_workflow tool
   */
  private async handleTriggerWorkflow(args: unknown) {
    const input = TriggerWorkflowInputSchema.parse(args);

    try {
      // First, get the workflow by name to find its webhook
      const workflows = await this.axiosInstance.get<{ data: Workflow[] }>('/workflows', {
        params: { filter: `{ "name": "${input.workflowName}" }` },
      });

      if (!workflows.data.data || workflows.data.data.length === 0) {
        throw new N8nApiError(`Workflow "${input.workflowName}" not found`, 404);
      }

      const workflow = workflows.data.data[0];

      // Trigger webhook (assuming webhook path is /webhook/{workflowId})
      // Note: Actual webhook URL format may vary based on n8n setup
      const webhookUrl = `${this.config.N8N_BASE_URL}/webhook/${workflow.id}`;
      const response = await axios.post(webhookUrl, input.payload, {
        headers: this.config.N8N_WEBHOOK_SECRET
          ? { 'X-Webhook-Secret': this.config.N8N_WEBHOOK_SECRET }
          : {},
        timeout: 30000,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                workflowId: workflow.id,
                workflowName: workflow.name,
                response: response.data,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      throw this.transformAxiosError(error, 'Failed to trigger workflow');
    }
  }

  /**
   * Handle list_workflows tool
   */
  private async handleListWorkflows() {
    try {
      const response = await this.axiosInstance.get<{ data: Workflow[] }>('/workflows', {
        params: { active: true },
      });

      const workflows = response.data.data.map((wf) => ({
        id: wf.id,
        name: wf.name,
        active: wf.active,
        createdAt: wf.createdAt,
        updatedAt: wf.updatedAt,
        tags: wf.tags,
      }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                count: workflows.length,
                workflows,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      throw this.transformAxiosError(error, 'Failed to list workflows');
    }
  }

  /**
   * Handle get_workflow_status tool
   */
  private async handleGetWorkflowStatus(args: unknown) {
    const input = GetWorkflowStatusInputSchema.parse(args);

    try {
      const response = await this.axiosInstance.get<{ data: Execution }>(
        `/executions/${input.executionId}`
      );

      const execution = response.data.data;

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                execution: {
                  id: execution.id,
                  workflowId: execution.workflowId,
                  finished: execution.finished,
                  status: execution.status,
                  startedAt: execution.startedAt,
                  stoppedAt: execution.stoppedAt,
                  mode: execution.mode,
                },
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      throw this.transformAxiosError(error, 'Failed to get workflow status');
    }
  }

  /**
   * Handle create_patient_task tool
   */
  private async handleCreatePatientTask(args: unknown) {
    const input = CreatePatientTaskInputSchema.parse(args);

    try {
      // Get workflow by name
      const workflows = await this.axiosInstance.get<{ data: Workflow[] }>('/workflows', {
        params: { filter: `{ "name": "${input.workflowName}" }` },
      });

      if (!workflows.data.data || workflows.data.data.length === 0) {
        throw new N8nApiError(`Workflow "${input.workflowName}" not found`, 404);
      }

      const workflow = workflows.data.data[0];

      // Prepare patient task payload
      const taskPayload = {
        patientId: input.patientId,
        taskType: input.taskType,
        priority: input.priority,
        description: input.description,
        dueDate: input.dueDate,
        assignedTo: input.assignedTo,
        metadata: input.metadata,
        createdAt: new Date().toISOString(),
      };

      // Trigger webhook with task payload
      const webhookUrl = `${this.config.N8N_BASE_URL}/webhook/${workflow.id}`;
      const response = await axios.post(webhookUrl, taskPayload, {
        headers: this.config.N8N_WEBHOOK_SECRET
          ? { 'X-Webhook-Secret': this.config.N8N_WEBHOOK_SECRET }
          : {},
        timeout: 30000,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                workflowId: workflow.id,
                workflowName: workflow.name,
                task: taskPayload,
                response: response.data,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      throw this.transformAxiosError(error, 'Failed to create patient task');
    }
  }

  /**
   * Transform Axios errors into N8nApiError
   */
  private transformAxiosError(error: unknown, message: string): N8nApiError {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      return new N8nApiError(
        `${message}: ${axiosError.message}`,
        axiosError.response?.status,
        axiosError.response?.data
      );
    }
    return new N8nApiError(message);
  }

  /**
   * Handle tool execution errors
   */
  private handleToolError(error: unknown) {
    console.error('Tool execution error:', error);

    if (error instanceof N8nApiError) {
      throw new McpError(
        ErrorCode.InternalError,
        `n8n API Error (${error.statusCode}): ${error.message}`
      );
    }

    if (error instanceof ValidationError) {
      throw new McpError(ErrorCode.InvalidParams, `Validation Error: ${error.message}`);
    }

    if (error instanceof McpError) {
      throw error;
    }

    throw new McpError(ErrorCode.InternalError, `Unexpected error: ${(error as Error).message}`);
  }

  /**
   * Setup global error handling
   */
  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('n8n-workflow-mcp server running on stdio');
  }
}

/**
 * Main entry point
 */
async function main() {
  try {
    const server = new N8nWorkflowMcpServer();
    await server.start();
  } catch (error) {
    if (error instanceof ConfigurationError) {
      console.error('Configuration Error:', error.message);
      console.error('\nPlease ensure the following environment variables are set:');
      console.error('  - N8N_BASE_URL (e.g., https://your-n8n-instance.com)');
      console.error('  - N8N_API_KEY (your n8n API key)');
      console.error('  - N8N_WEBHOOK_SECRET (optional)');
      process.exit(1);
    }

    console.error('Fatal error starting server:', error);
    process.exit(1);
  }
}

main();
