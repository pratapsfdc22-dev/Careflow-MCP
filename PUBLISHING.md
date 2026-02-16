# Publishing Guide - careflow-mcp

Complete guide to publishing your MCP server to npm and listing it on mcp.so.

---

## Prerequisites

Before publishing, ensure you have:

- ✅ [npm account](https://www.npmjs.com/signup) (free)
- ✅ [GitHub account](https://github.com) with repository created
- ✅ npm CLI installed (`npm --version`)
- ✅ All personal information removed from code
- ✅ Project built successfully (`npm run build`)

---

## Step 1: Prepare Repository

### 1.1 Update package.json

Replace placeholder values:

```json
{
  "name": "careflow-mcp",
  "author": "Your Name <your.email@example.com>",  // ← Update this
  "repository": {
    "url": "https://github.com/pratapsfdc22-dev/careflow-mcp.git"  // ← Update
  },
  "bugs": {
    "url": "https://github.com/pratapsfdc22-dev/careflow-mcp/issues"  // ← Update
  },
  "homepage": "https://github.com/pratapsfdc22-dev/careflow-mcp#readme"  // ← Update
}
```

### 1.2 Update mcp.json

Replace placeholder values:

```json
{
  "author": {
    "name": "Your Name",  // ← Update
    "url": "https://github.com/pratapsfdc22-dev"  // ← Update
  },
  "repository": {
    "url": "https://github.com/pratapsfdc22-dev/careflow-mcp"  // ← Update
  }
}
```

### 1.3 Verify Build

```bash
# Clean and rebuild
npm run clean
npm run build

# Verify dist/ folder exists
ls -la dist/

# Test the server locally
npm run dev
```

---

## Step 2: Create GitHub Repository

### 2.1 Create Repository on GitHub

```bash
# Go to: https://github.com/new
# Repository name: careflow-mcp
# Description: Production-ready MCP server for n8n workflow automation
# Public repository
# Do NOT initialize with README (you already have one)
```

### 2.2 Push to GitHub

**IMPORTANT**: Fix Command Line Tools first if needed (see main README troubleshooting).

```bash
cd ~/Documents/careflow-mcp

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Production-ready careflow-mcp server

- Add MCP server implementation with 4 tools
- Add TypeScript types and Zod validation
- Add comprehensive HIPAA compliance documentation
- Add case studies with ROI metrics
- Add importable workflow examples
- Configure for mcp.so publishing

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Add remote (replace with your GitHub URL)
git remote add origin https://github.com/pratapsfdc22-dev/careflow-mcp.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Step 3: Publish to npm

### 3.1 Login to npm

```bash
npm login
# Enter your npm username, password, and email
# You'll receive a one-time password (OTP) via email
```

### 3.2 Verify Package

```bash
# Check what will be published
npm pack --dry-run

# Expected output should include:
# - dist/index.js
# - dist/types.js
# - dist/*.d.ts
# - package.json
# - README.md
# - LICENSE
# - mcp.json

# Should NOT include:
# - src/
# - case-studies/
# - examples/
# - .env files
```

### 3.3 Publish to npm

```bash
# First publish (version 1.0.0)
npm publish --access public

# You should see:
# + careflow-mcp@1.0.0
```

### 3.4 Verify Published Package

```bash
# Check on npm
open https://www.npmjs.com/package/careflow-mcp

# Test installation
npm install -g careflow-mcp

# Test it works
careflow-mcp --version
```

---

## Step 4: List on mcp.so

### 4.1 Submit to mcp.so

**Option A: Automatic via Smithery** (Recommended)

```bash
# Register with Smithery
npx @smithery/cli register careflow-mcp

# This will:
# 1. Validate your mcp.json
# 2. Verify package is on npm
# 3. Submit to mcp.so directory
# 4. Make it installable via Smithery
```

**Option B: Manual Submission**

1. Go to [mcp.so](https://mcp.so)
2. Click "Submit Server"
3. Fill in the form:
   - **Name**: careflow-mcp
   - **npm package**: careflow-mcp
   - **GitHub URL**: https://github.com/pratapsfdc22-dev/careflow-mcp
   - **Description**: Production-ready MCP server for n8n workflow automation
   - **Categories**: Automation, Healthcare, Workflow
   - **Icon**: ⚡

### 4.2 Verify Listing

Once approved (usually 24-48 hours):

```bash
# Install via Smithery
npx @smithery/cli install careflow-mcp

# Should automatically configure Claude Desktop
```

---

## Step 5: Create GitHub Release

### 5.1 Create Release

```bash
# On GitHub, go to:
# https://github.com/pratapsfdc22-dev/careflow-mcp/releases/new

# Tag version: v1.0.0
# Release title: v1.0.0 - Initial Release
# Description:
```

```markdown
## 🎉 Initial Release

Production-ready MCP server for n8n workflow automation with HIPAA-compliant healthcare workflows.

### Features

- 🚀 Trigger n8n workflows via natural language
- 📊 Real-time workflow execution monitoring
- 🏥 Healthcare-specific patient task management
- 🔒 Type-safe with Zod validation
- 📚 Comprehensive documentation with case studies

### Tools

- `trigger_workflow` - Execute workflows with custom payloads
- `list_workflows` - Query all active workflows
- `get_workflow_status` - Monitor execution status
- `create_patient_task` - HIPAA-compliant task creation

### Documentation

- [HIPAA Compliance Guide](./HEALTHCARE.md)
- [Case Studies](./case-studies/README.md) with ROI metrics
- [Example Workflows](./examples/) (importable)

### Installation

```bash
# Via Smithery
npx @smithery/cli install careflow-mcp

# Via npm
npm install -g careflow-mcp
```

### What's Included

- Production-ready TypeScript implementation
- 2 importable n8n workflow examples
- 2 comprehensive case studies
- 30+ page HIPAA compliance guide
- Full API documentation
```

---

## Step 6: Update Version (Future Releases)

### 6.1 Update Version Number

```bash
# Patch release (1.0.0 → 1.0.1)
npm version patch

# Minor release (1.0.0 → 1.1.0)
npm version minor

# Major release (1.0.0 → 2.0.0)
npm version major
```

### 6.2 Push and Publish

```bash
# Push with tags
git push && git push --tags

# Publish to npm
npm publish
```

---

## Checklist

Before publishing, verify:

- [ ] All placeholder values updated (author, repository URLs)
- [ ] Personal information removed (emails, paths)
- [ ] Project builds successfully (`npm run build`)
- [ ] Tests pass (if any)
- [ ] README is accurate and complete
- [ ] LICENSE file included
- [ ] .npmignore configured (don't publish src/)
- [ ] mcp.json is valid
- [ ] GitHub repository created and pushed
- [ ] npm account created and logged in
- [ ] Package published to npm
- [ ] Verified package on npmjs.com
- [ ] Submitted to mcp.so
- [ ] GitHub release created

---

## Troubleshooting

### "You do not have permission to publish"

```bash
# Check if package name is taken
npm search careflow-mcp

# If taken, choose a different name:
# careflow-mcp-server
# n8n-mcp-workflows
# etc.
```

### "Module not found" after publishing

```bash
# Verify dist/ folder is included
npm pack --dry-run

# Ensure .npmignore doesn't exclude dist/
```

### "Invalid mcp.json"

```bash
# Validate JSON syntax
cat mcp.json | jq .

# Check required fields:
# - name, version, description
# - tools array with at least one tool
# - configuration.env with N8N_BASE_URL and N8N_API_KEY
```

### Command Line Tools error (macOS)

See main README troubleshooting section for fixing xcrun errors.

---

## Marketing Your MCP Server

### 1. Social Media

**Twitter/X**:
```
🚀 Just published careflow-mcp - a production-ready MCP server
for @n8n_io workflow automation!

✨ Features:
• 🏥 HIPAA-compliant healthcare workflows
• 📊 Real-time execution monitoring
• 📚 Comprehensive case studies

Install: npx @smithery/cli install careflow-mcp

#MCP #n8n #Automation #Claude
```

**LinkedIn**:
```
Excited to announce the release of careflow-mcp!

This Model Context Protocol server enables AI assistants like
Claude to trigger and manage n8n workflows through natural language.

Key differentiator: Complete HIPAA compliance documentation
for healthcare implementations.

[Link to GitHub]
```

### 2. Communities

Post in:
- [MCP Discord](https://discord.gg/modelcontextprotocol)
- [n8n Community](https://community.n8n.io/)
- Reddit: r/n8n, r/automation
- Dev.to blog post
- Hacker News Show HN

### 3. Documentation

Create:
- YouTube demo video
- Blog post walkthrough
- Tweet thread with examples

---

## Maintenance

### Regular Updates

- **Weekly**: Monitor issues and discussions
- **Monthly**: Update dependencies (`npm update`)
- **Quarterly**: Review and update documentation
- **Yearly**: Major version bump with new features

### Community Engagement

- Respond to GitHub issues within 48 hours
- Update examples based on user feedback
- Add new case studies from real implementations
- Keep dependencies up to date

---

## Support

Questions about publishing?

- 📚 [npm Publishing Guide](https://docs.npmjs.com/cli/v10/commands/npm-publish)
- 💬 [MCP Discord](https://discord.gg/modelcontextprotocol)
- 📖 [Smithery Docs](https://smithery.ai/docs)

---

**Ready to publish? Follow the steps above and your MCP server will be live!** 🚀
