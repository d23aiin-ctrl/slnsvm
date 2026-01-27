
# AI Architecture – SLNSVM Website (LangGraph Based)

## Overview
The AI system uses LangGraph to orchestrate multiple specialized AI agents.

## Components

### Central Orchestrator
- Routes user queries
- Maintains context
- Controls permissions

### Agents
- Student Learning Agent
- Teacher Assistant Agent
- Admin Assistant Agent
- Parent Support Agent
- Career Guidance Agent
- Compliance Agent

## Data Flow

User → Chatbot UI → LangGraph Router → Specialized Agent → LLM → Response → User

## Storage
- Vector DB for school documents
- Relational DB for student data

## Safety Controls
- Role-based prompts
- Data isolation
- Human override

## Supported Interfaces
- Website chatbot
- Admin panel
- Teacher dashboard
- WhatsApp (optional)

