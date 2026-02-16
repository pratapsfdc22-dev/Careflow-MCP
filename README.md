# CareFlow MCP 🏥

Production-ready healthcare workflow automation powered by n8n and the Model Context Protocol. Enables Claude and other AI assistants to trigger HIPAA-compliant patient task management workflows through natural language.

[![NPM Version](https://img.shields.io/npm/v/careflow-mcp)](https://www.npmjs.com/package/careflow-mcp)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![MCP SDK](https://img.shields.io/badge/MCP%20SDK-1.0.4-green)](https://github.com/modelcontextprotocol/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![mcp.so](https://img.shields.io/badge/mcp.so-listed-blue)](https://mcp.so)

> 🏥 **Healthcare-Ready**: Includes comprehensive HIPAA compliance documentation and patient task management workflows.

## Features

- 🚀 **Trigger Workflows** - Execute n8n workflows via webhook with custom payloads
- 📋 **List Workflows** - Query all active workflows from your n8n instance
- 📊 **Check Status** - Monitor workflow execution status in real-time
- 🏥 **Healthcare-Ready** - Built-in support for patient task workflows
- 🔒 **Type-Safe** - Full TypeScript support with Zod validation
- ⚡ **Production-Ready** - Comprehensive error handling and logging
- 🛠️ **MCP Standard** - Compatible with Claude Desktop and other MCP clients

## 📚 Documentation & Examples

- **[Case Studies](./case-studies/README.md)** - 5 real-world implementation examples with ROI metrics
- **[HEALTHCARE.md](./HEALTHCARE.md)** - Comprehensive HIPAA compliance guide (our differentiator!)
- **[Example Workflows](./examples/)** - Importable n8n workflow JSON files

### Quick Start with Examples

```bash
# 1. Import workflow to n8n
examples/healthcare-patient-task-workflow.json

# 2. Configure credentials in n8n

# 3. Ask Claude:
"Create a patient task for ID P12345 in the Patient Care workflow"
```

## Tools Exposed

| Tool | Description | Required Params |
|------|-------------|----------------|
| `trigger_workflow` | Triggers an n8n workflow by name with JSON payload | `workflowName`, `payload` |
| `list_workflows` | Lists all active workflows from n8n | None |
| `get_workflow_status` | Checks execution status by ID | `executionId` |
| `create_patient_task` | Sends structured patient task to workflow | `workflowName`, `patientId`, `taskType` |

## Prerequisites

- **Node.js** >= 18.0.0
- **n8n instance** (cloud or self-hosted) with API access
- **n8n API Key** (generate in n8n Settings > API)

## Installation

### Option 1: Via Smithery (Easiest)

Install directly from [mcp.so](https://mcp.so) using Smithery:

```bash
npx @smithery/cli install careflow-mcp
```

This will automatically:
- Install the package
- Add to your Claude Desktop config
- Prompt for required environment variables

### Option 2: NPM Installation

```bash
npm install -g careflow-mcp
```

### Option 3: From Source

```bash
# Clone the repository
git clone https://github.com/pratapsfdc22-dev/careflow-mcp.git
cd careflow-mcp

# Install dependencies
npm install

# Build the project
npm run build

# Link globally (optional)
npm link
```

## Configuration

### 1. Create Environment File

```bash
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env` with your n8n credentials:

```bash
# Base URL of your n8n instance
N8N_BASE_URL=https://your-n8n-instance.com

# n8n API Key (Settings > API > Create API Key)
N8N_API_KEY=n8n_api_xxxxxxxxxxxxxxxxxxxxxxxx

# Optional: Webhook Secret
N8N_WEBHOOK_SECRET=your_webhook_secret
```

### 3. Configure Claude Desktop

Add to your `claude_desktop_config.json`:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "n8n-workflow": {
      "command": "node",
      "args": [
        "/path/to/careflow-mcp/dist/index.js"
      ],
      "env": {
        "N8N_BASE_URL": "https://your-n8n-instance.com",
        "N8N_API_KEY": "your_api_key_here",
        "N8N_WEBHOOK_SECRET": "your_webhook_secret"
      }
    }
  }
}
```

**Using npm global install:**

```json
{
  "mcpServers": {
    "n8n-workflow": {
      "command": "careflow-mcp",
      "env": {
        "N8N_BASE_URL": "https://your-n8n-instance.com",
        "N8N_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Usage Examples

### 1. Trigger a Workflow

```typescript
// Ask Claude:
"Trigger the 'Customer Onboarding' workflow with this data:
{ email: 'user@example.com', name: 'John Doe' }"
```

### 2. List All Active Workflows

```typescript
// Ask Claude:
"Show me all active n8n workflows"
```

### 3. Check Workflow Execution Status

```typescript
// Ask Claude:
"Check the status of execution ID: abc123"
```

### 4. Create a Patient Task

```typescript
// Ask Claude:
"Create a high-priority follow-up task for patient ID P12345
in the 'Patient Care' workflow, due tomorrow"
```

## Development

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run watch
```

### Run Locally

```bash
npm run dev
```

### Clean Build Artifacts

```bash
npm run clean
```

## Project Structure

```
careflow-mcp/
├── src/
│   ├── index.ts        # Main MCP server implementation
│   └── types.ts        # TypeScript types and Zod schemas
├── dist/               # Compiled JavaScript (generated)
├── .env.example        # Environment variable template
├── .gitignore          # Git ignore rules
├── package.json        # NPM package configuration
├── tsconfig.json       # TypeScript configuration
└── README.md           # This file
```

## API Reference

### trigger_workflow

Triggers an n8n workflow by name with optional JSON payload.

**Input:**
```typescript
{
  workflowName: string;    // Name of the workflow
  payload?: object;        // Optional JSON data
}
```

**Output:**
```json
{
  "success": true,
  "workflowId": "abc123",
  "workflowName": "Customer Onboarding",
  "response": { ... }
}
```

### list_workflows

Lists all active workflows from n8n instance.

**Input:** None

**Output:**
```json
{
  "success": true,
  "count": 5,
  "workflows": [
    {
      "id": "abc123",
      "name": "Customer Onboarding",
      "active": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T12:00:00.000Z"
    }
  ]
}
```

### get_workflow_status

Checks the execution status of a workflow run.

**Input:**
```typescript
{
  executionId: string;    // Execution ID from trigger response
}
```

**Output:**
```json
{
  "success": true,
  "execution": {
    "id": "exec123",
    "workflowId": "abc123",
    "finished": true,
    "status": "success",
    "startedAt": "2024-01-15T12:00:00.000Z",
    "stoppedAt": "2024-01-15T12:00:05.000Z"
  }
}
```

### create_patient_task

Sends a structured patient task to an n8n workflow.

**Input:**
```typescript
{
  workflowName: string;          // Target workflow
  patientId: string;             // Patient identifier
  taskType: string;              // Task type
  priority?: "low" | "medium" | "high" | "urgent";
  description?: string;
  dueDate?: string;              // ISO 8601 format
  assignedTo?: string;
  metadata?: object;
}
```

**Output:**
```json
{
  "success": true,
  "workflowId": "abc123",
  "workflowName": "Patient Care",
  "task": { ... },
  "response": { ... }
}
```

## Error Handling

The server implements comprehensive error handling with proper MCP error codes:

- **Invalid Parameters** - `ErrorCode.InvalidParams`
- **Method Not Found** - `ErrorCode.MethodNotFound`
- **Internal Error** - `ErrorCode.InternalError`

All errors include descriptive messages for debugging.

## Security Best Practices

1. **Never commit `.env`** - Always use `.env.example` for templates
2. **Rotate API keys** - Regularly update your n8n API keys
3. **Use webhook secrets** - Add authentication to webhook triggers
4. **Restrict API access** - Use n8n's API key permissions
5. **Monitor logs** - Check server logs for suspicious activity

## Troubleshooting

### Server won't start

```bash
# Check Node.js version
node --version  # Should be >= 18.0.0

# Verify environment variables
cat .env

# Check TypeScript compilation
npm run build
```

### Workflow not found

- Verify the workflow name matches exactly (case-sensitive)
- Ensure the workflow is active in n8n
- Check API key has permission to access workflows

### Authentication failed

- Verify `N8N_API_KEY` is correct
- Check `N8N_BASE_URL` includes protocol (https://)
- Ensure API key hasn't expired

### Webhook trigger fails

- Verify webhook node exists in workflow
- Check webhook path matches workflow ID
- Confirm `N8N_WEBHOOK_SECRET` if required

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Model Context Protocol SDK](https://github.com/modelcontextprotocol/sdk)
- Powered by [n8n workflow automation](https://n8n.io)
- Type validation by [Zod](https://github.com/colinhacks/zod)

## Support

- 🐛 Issues: [GitHub Issues](https://github.com/pratapsfdc22-dev/careflow-mcp/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/pratapsfdc22-dev/careflow-mcp/discussions)
- 📖 Documentation: [Full API Reference](https://github.com/pratapsfdc22-dev/careflow-mcp)

---

**Built with the Model Context Protocol**
