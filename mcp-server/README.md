# MCP K8s Health Monitor

AI-powered Kubernetes cluster health monitoring via Claude Desktop.

## Features

- List unhealthy pods across all namespaces
- Monitor resource usage (CPU/Memory) 
- Generate comprehensive health reports
- Natural language queries about cluster state

## Setup

1. Install dependencies:
```bash
cd mcp-server
npm install
```

2. Configure kubectl to access your cluster:
```bash
aws eks update-kubeconfig --region eu-west-2 --name mcp-k8s-cluster
```

3. Add to Claude Desktop config:
```json
{
  "mcpServers": {
    "k8s-health": {
      "command": "node",
      "args": ["C:/path/to/mcp-server/index.js"]
    }
  }
}
```

## Available Commands

Once connected in Claude, you can ask:
- "What pods are unhealthy?"
- "Show me resource usage"
- "Generate a cluster health report"
- "Is my cluster healthy?"
- "Which namespace is using the most CPU?"

## Testing

Test locally:
```bash
npm start
```

The server includes mock data for testing without cluster access.