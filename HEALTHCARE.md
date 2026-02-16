# Healthcare Implementation Guide

## HIPAA Compliance with careflow-mcp

This guide provides comprehensive documentation for implementing the careflow-mcp server in healthcare environments with HIPAA compliance considerations.

---

## Table of Contents

1. [Overview](#overview)
2. [HIPAA Requirements](#hipaa-requirements)
3. [Security Considerations](#security-considerations)
4. [Architecture Guidelines](#architecture-guidelines)
5. [Data Handling](#data-handling)
6. [Audit Logging](#audit-logging)
7. [Implementation Checklist](#implementation-checklist)
8. [Example Use Cases](#example-use-cases)

---

## Overview

The careflow-mcp server is designed to facilitate healthcare workflow automation while maintaining HIPAA compliance. This document outlines best practices, security measures, and architectural patterns for healthcare implementations.

### Key Differentiators

- ✅ **Built-in PHI handling** - Structured patient task schema
- ✅ **Audit trail support** - Comprehensive logging for compliance
- ✅ **Encryption-ready** - TLS/SSL support for data in transit
- ✅ **Role-based access** - Integration with n8n's permission system
- ✅ **Data minimization** - Only necessary patient data in workflows

---

## HIPAA Requirements

### Technical Safeguards (§ 164.312)

#### 1. Access Control
```json
{
  "requirement": "Unique user identification",
  "implementation": [
    "N8N_API_KEY with user-specific credentials",
    "Webhook secrets for authenticated endpoints",
    "Role-based workflow access in n8n"
  ]
}
```

#### 2. Audit Controls
```json
{
  "requirement": "Record and examine activity",
  "implementation": [
    "Execution logging in n8n",
    "MCP server error logging",
    "Workflow execution timestamps",
    "Patient data access tracking"
  ]
}
```

#### 3. Integrity Controls
```json
{
  "requirement": "Protect ePHI from improper alteration",
  "implementation": [
    "Input validation with Zod schemas",
    "Immutable execution history",
    "Version control for workflows"
  ]
}
```

#### 4. Transmission Security
```json
{
  "requirement": "Protect ePHI during transmission",
  "implementation": [
    "HTTPS/TLS for all API calls",
    "Encrypted webhook endpoints",
    "Secure credential storage"
  ]
}
```

---

## Security Considerations

### 1. Environment Configuration

**✅ SECURE Configuration**:
```bash
# Use HTTPS endpoints only
N8N_BASE_URL=https://n8n.yourhospital.com

# Strong API key (minimum 32 characters)
N8N_API_KEY=n8n_api_[secure-key-minimum-32-chars]

# Webhook authentication
N8N_WEBHOOK_SECRET=[strong-secret-min-16-chars]
```

**❌ INSECURE Configuration**:
```bash
# Never use HTTP in production
N8N_BASE_URL=http://localhost:5678  # ❌ INSECURE

# Weak or default keys
N8N_API_KEY=test123  # ❌ INSECURE
```

### 2. Network Security

#### Infrastructure Requirements:
- ✅ Deploy n8n behind VPN or private network
- ✅ Use firewall rules to restrict access
- ✅ Enable IP whitelisting for API access
- ✅ Implement rate limiting
- ✅ Use AWS PrivateLink or Azure Private Link for cloud deployments

#### n8n Deployment:
```yaml
# docker-compose.yml (example)
version: '3.8'
services:
  n8n:
    image: n8nio/n8n
    environment:
      - N8N_PROTOCOL=https
      - N8N_SSL_KEY=/ssl/key.pem
      - N8N_SSL_CERT=/ssl/cert.pem
      - WEBHOOK_URL=https://n8n.secure-domain.com
      - N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true
    volumes:
      - ./ssl:/ssl:ro
      - n8n_data:/home/node/.n8n
    networks:
      - private_network

networks:
  private_network:
    driver: bridge
    internal: true
```

### 3. Data Encryption

#### At Rest:
- ✅ Encrypt n8n database (PostgreSQL with TDE)
- ✅ Encrypt workflow execution data
- ✅ Use encrypted file storage (S3 with SSE-KMS)

#### In Transit:
- ✅ TLS 1.3 for all connections
- ✅ Certificate pinning for critical endpoints
- ✅ Encrypted database connections

---

## Architecture Guidelines

### Recommended Architecture

```
┌─────────────────────────────────────────────────────┐
│                    DMZ / Edge                       │
│  ┌─────────────────────────────────────────────┐   │
│  │   Load Balancer (HTTPS, WAF)                 │   │
│  └──────────────────┬──────────────────────────┘   │
└────────────────────┼─────────────────────────────────┘
                     │
┌────────────────────┼─────────────────────────────────┐
│         Private Network (VPC)                        │
│                    │                                 │
│  ┌─────────────────▼──────────────────────────┐     │
│  │   n8n Instance (HTTPS, API Key Auth)        │     │
│  │   - Workflows                               │     │
│  │   - Execution Engine                        │     │
│  │   - API Server                              │     │
│  └──────────────────┬──────────────────────────┘     │
│                     │                                │
│  ┌─────────────────▼──────────────────────────┐     │
│  │   PostgreSQL (Encrypted)                    │     │
│  │   - Workflow definitions                    │     │
│  │   - Execution history                       │     │
│  │   - Credentials (encrypted at rest)         │     │
│  └─────────────────────────────────────────────┘     │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │   MCP Server (careflow-mcp)              │   │
│  │   - Runs on secure workstation               │   │
│  │   - Communicates with n8n via API            │   │
│  │   - Used by Claude Desktop (local only)      │   │
│  └──────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
                     │
┌────────────────────┼─────────────────────────────────┐
│         Secure Integrations                          │
│  ┌─────────────────▼──────────────────────────┐     │
│  │   EHR System (HL7/FHIR)                     │     │
│  │   - Patient records                         │     │
│  │   - Appointments                            │     │
│  └─────────────────────────────────────────────┘     │
│                                                      │
│  ┌─────────────────────────────────────────────┐     │
│  │   Secure Notification Services              │     │
│  │   - HIPAA-compliant email                   │     │
│  │   - Encrypted SMS                           │     │
│  └─────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────┘
```

### Key Principles:

1. **Network Segmentation**: n8n runs in private network, not internet-facing
2. **API Gateway**: Load balancer with WAF for threat protection
3. **Encrypted Storage**: All data encrypted at rest
4. **Audit Logging**: Centralized logging for compliance
5. **Access Control**: API keys + webhook secrets + firewall rules

---

## Data Handling

### PHI (Protected Health Information) Classification

#### ✅ Allowed in Workflows:
- Patient identifiers (MRN, Patient ID)
- Appointment dates/times
- Task descriptions (clinical summary)
- Provider assignments
- Care team information

#### ⚠️ Minimize or Exclude:
- Full medical records
- Diagnostic images
- Detailed clinical notes
- Social Security Numbers
- Financial information

### Data Minimization Pattern

**Instead of passing full patient record**:
```javascript
// ❌ BAD - Too much PHI
{
  "patientId": "P12345",
  "fullName": "John Doe",
  "dob": "1980-01-01",
  "ssn": "123-45-6789",
  "diagnosis": "Type 2 Diabetes...",
  "medications": [...],
  "insuranceInfo": {...}
}
```

**Use references and fetch on-demand**:
```javascript
// ✅ GOOD - Minimal PHI
{
  "patientId": "P12345",
  "taskType": "followup_appointment",
  "priority": "high",
  "assignedTo": "Dr. Smith",
  "dueDate": "2024-03-15"
}
```

### Patient Task Schema (HIPAA-Optimized)

```typescript
interface PatientTask {
  patientId: string;          // Reference ID only
  taskType: string;           // Clinical task category
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description?: string;       // Brief summary (no detailed PHI)
  dueDate?: string;           // ISO 8601 format
  assignedTo?: string;        // Provider reference
  metadata?: {
    facilityId?: string;
    departmentId?: string;
    referenceUrl?: string;    // Link to EHR for full context
  };
}
```

---

## Audit Logging

### Required Audit Fields

Every workflow execution should log:

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "executionId": "exec_abc123",
  "workflowId": "wf_patient_task",
  "workflowName": "Patient Task Creation",
  "userId": "user_doctor_smith",
  "action": "create_patient_task",
  "patientId": "P12345",
  "status": "success",
  "ipAddress": "10.0.1.45",
  "userAgent": "careflow-mcp/1.0.0"
}
```

### n8n Logging Configuration

Enable execution logging in n8n:

```bash
# n8n environment variables
N8N_LOG_LEVEL=info
N8N_LOG_OUTPUT=file,console
N8N_LOG_FILE_LOCATION=/var/log/n8n/
N8N_EXECUTIONS_MODE=regular  # Not 'queue' to ensure full logging
```

### Centralized Logging

Forward logs to SIEM (Security Information and Event Management):

```javascript
// Example: Forward to Splunk/ELK
// n8n workflow node: HTTP Request
POST https://your-siem.com/api/logs
{
  "event": "patient_task_created",
  "timestamp": "{{ $now }}",
  "execution_id": "{{ $execution.id }}",
  "patient_id": "{{ $json.patientId }}",
  "user": "{{ $env.USER_ID }}"
}
```

---

## Implementation Checklist

### Pre-Deployment

- [ ] **Security Review**
  - [ ] Network architecture reviewed
  - [ ] Firewall rules configured
  - [ ] TLS/SSL certificates valid
  - [ ] API keys rotated and secured

- [ ] **HIPAA Compliance**
  - [ ] Business Associate Agreement (BAA) with n8n cloud (if applicable)
  - [ ] Risk assessment completed
  - [ ] Data flow diagram created
  - [ ] Privacy impact assessment

- [ ] **Infrastructure**
  - [ ] n8n deployed on private network
  - [ ] Database encryption enabled
  - [ ] Backup strategy implemented
  - [ ] Disaster recovery plan

### Post-Deployment

- [ ] **Monitoring**
  - [ ] Audit logging enabled
  - [ ] Alerts configured
  - [ ] Performance monitoring
  - [ ] Security monitoring (SIEM)

- [ ] **Access Control**
  - [ ] User roles defined in n8n
  - [ ] API keys assigned per user
  - [ ] Webhook secrets configured
  - [ ] Access reviewed quarterly

- [ ] **Training**
  - [ ] Staff trained on secure usage
  - [ ] Incident response procedures
  - [ ] PHI handling guidelines
  - [ ] Regular security awareness training

---

## Example Use Cases

### 1. Appointment Reminder System

**Scenario**: Automated appointment reminders without exposing PHI

```javascript
// Claude command:
"Create an appointment reminder task for patient P12345
scheduled for tomorrow at 2 PM with Dr. Johnson"

// n8n workflow:
1. Receive task via webhook
2. Lookup patient contact (encrypted) from EHR
3. Send HIPAA-compliant SMS via Twilio
4. Log execution to audit system
5. Return confirmation to Claude
```

**Benefits**:
- No PHI in Claude conversation
- Patient contact info stays in EHR
- Full audit trail
- Encrypted SMS delivery

### 2. Lab Results Notification

**Scenario**: Notify care team when critical lab results arrive

```javascript
// Claude command:
"Create a high-priority task for Dr. Smith -
patient P12345 has critical lab results ready for review"

// n8n workflow:
1. Receive notification from lab system (HL7)
2. Create task in EHR task management
3. Send secure message to provider portal
4. Log access to lab results
5. Track acknowledgment
```

**Benefits**:
- Minimal PHI exposure
- Real-time critical alerts
- Provider acknowledgment tracking
- Compliance audit trail

### 3. Care Coordination

**Scenario**: Coordinate multi-disciplinary care team

```javascript
// Claude command:
"Create a care coordination meeting for patient P12345
with cardiology, endocrinology, and primary care -
schedule for next Tuesday"

// n8n workflow:
1. Check provider availability
2. Schedule meeting in EHR
3. Send calendar invites (encrypted)
4. Create prep tasks for each specialist
5. Generate meeting agenda template
```

**Benefits**:
- Streamlined team coordination
- Automated scheduling
- Preparation task tracking
- Meeting documentation

---

## Compliance Resources

### HIPAA References

- **HHS HIPAA Security Rule**: [https://www.hhs.gov/hipaa/for-professionals/security/index.html](https://www.hhs.gov/hipaa/for-professionals/security/index.html)
- **NIST Cybersecurity Framework**: [https://www.nist.gov/cyberframework](https://www.nist.gov/cyberframework)
- **HITRUST CSF**: [https://hitrustalliance.net/](https://hitrustalliance.net/)

### Recommended Certifications

- HITRUST CSF Certified
- SOC 2 Type II
- ISO 27001

---

## Support

For healthcare-specific implementation questions:

- 📖 [Documentation](https://github.com/pratapsfdc22-dev/careflow-mcp)
- 💬 [Healthcare Discussions](https://github.com/pratapsfdc22-dev/careflow-mcp/discussions/categories/healthcare)
- 🏥 [Case Study: Healthcare Patient Management](./case-studies/01-healthcare-patient-management.md)

---

## Disclaimer

This documentation provides guidance for HIPAA-compliant implementations but does not constitute legal advice. Consult with your organization's compliance and legal teams before deploying in production healthcare environments.

**Key Points**:
- Conduct your own risk assessment
- Obtain Business Associate Agreements (BAAs)
- Implement additional controls as required by your organization
- Regular security audits and penetration testing
- Maintain documentation for compliance audits

---

**Last Updated**: 2024-01-15
**Version**: 1.0.0
