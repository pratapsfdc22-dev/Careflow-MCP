import { z } from 'zod';

/**
 * Environment configuration schema
 */
export const EnvConfigSchema = z.object({
  N8N_BASE_URL: z.string().url('N8N_BASE_URL must be a valid URL'),
  N8N_API_KEY: z.string().min(1, 'N8N_API_KEY is required'),
  N8N_WEBHOOK_SECRET: z.string().optional(),
});

export type EnvConfig = z.infer<typeof EnvConfigSchema>;

/**
 * n8n Workflow Schema (API Response)
 */
export const WorkflowSchema = z.object({
  id: z.string(),
  name: z.string(),
  active: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  tags: z.array(z.object({ id: z.string(), name: z.string() })).optional(),
  versionId: z.string().optional(),
});

export type Workflow = z.infer<typeof WorkflowSchema>;

/**
 * n8n Execution Schema (API Response)
 */
export const ExecutionSchema = z.object({
  id: z.string(),
  finished: z.boolean(),
  mode: z.string(),
  retryOf: z.string().optional(),
  retrySuccessId: z.string().optional(),
  startedAt: z.string(),
  stoppedAt: z.string().optional(),
  workflowId: z.string(),
  waitTill: z.string().optional(),
  status: z.enum(['success', 'error', 'waiting', 'running', 'unknown']).optional(),
});

export type Execution = z.infer<typeof ExecutionSchema>;

/**
 * Tool Input Schemas
 */
export const TriggerWorkflowInputSchema = z.object({
  workflowName: z.string().min(1, 'Workflow name is required'),
  payload: z.record(z.any()).default({}),
});

export type TriggerWorkflowInput = z.infer<typeof TriggerWorkflowInputSchema>;

export const GetWorkflowStatusInputSchema = z.object({
  executionId: z.string().min(1, 'Execution ID is required'),
});

export type GetWorkflowStatusInput = z.infer<typeof GetWorkflowStatusInputSchema>;

export const CreatePatientTaskInputSchema = z.object({
  workflowName: z.string().min(1, 'Workflow name is required'),
  patientId: z.string().min(1, 'Patient ID is required'),
  taskType: z.string().min(1, 'Task type is required'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  assignedTo: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export type CreatePatientTaskInput = z.infer<typeof CreatePatientTaskInputSchema>;

/**
 * API Response Types
 */
export interface WorkflowListResponse {
  data: Workflow[];
}

export interface ExecutionResponse {
  data: Execution;
}

export interface TriggerWebhookResponse {
  executionId?: string;
  data?: any;
  message?: string;
}

/**
 * Error types for better error handling
 */
export class N8nApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'N8nApiError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public errors?: z.ZodError) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}
