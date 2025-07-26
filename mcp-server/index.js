#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import k8s from '@kubernetes/client-node';

// Initialize Kubernetes client
const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
const appsApi = kc.makeApiClient(k8s.AppsV1Api);
const metricsClient = new k8s.Metrics(kc);

// Tool implementations
async function getUnhealthyPods() {
  try {
    const pods = await k8sApi.listPodForAllNamespaces();
    const unhealthyPods = [];
    
    for (const pod of pods.body.items) {
      const isReady = pod.status.conditions?.find(c => c.type === 'Ready')?.status === 'True';
      const phase = pod.status.phase;
      const restarts = pod.status.containerStatuses?.[0]?.restartCount || 0;
      
      if (phase !== 'Running' || !isReady || restarts > 3) {
        unhealthyPods.push({
          name: pod.metadata.name,
          namespace: pod.metadata.namespace,
          status: phase,
          ready: isReady,
          restarts: restarts,
          reason: pod.status.containerStatuses?.[0]?.state?.waiting?.reason || 
                  pod.status.containerStatuses?.[0]?.state?.terminated?.reason ||
                  'Unknown',
          age: getAge(pod.metadata.creationTimestamp)
        });
      }
    }
    
    return JSON.stringify({
      unhealthy_count: unhealthyPods.length,
      pods: unhealthyPods
    }, null, 2);
  } catch (error) {
    throw new Error(`Failed to connect to Kubernetes cluster: ${error.message}. Ensure kubectl is configured.`);
  }
}

async function getResourceUsage() {
  try {
    // Get nodes
    const nodes = await k8sApi.listNode();
    const nodeMetrics = await metricsClient.getNodeMetrics();
    
    const nodeUsage = nodes.body.items.map((node, i) => {
      const metrics = nodeMetrics.items[i];
      const allocatable = node.status.allocatable;
      
      const cpuUsage = (parseInt(metrics.usage.cpu) / parseInt(allocatable.cpu) * 100).toFixed(1);
      const memUsage = (parseInt(metrics.usage.memory) / parseInt(allocatable.memory) * 100).toFixed(1);
      
      return {
        name: node.metadata.name,
        cpu_usage: `${cpuUsage}%`,
        memory_usage: `${memUsage}%`,
        status: node.status.conditions.find(c => c.type === 'Ready')?.status === 'True' ? 'Ready' : 'NotReady'
      };
    });
    
    // Get namespace usage
    const namespaces = await k8sApi.listNamespace();
    const namespaceUsage = {};
    
    for (const ns of namespaces.body.items) {
      const pods = await k8sApi.listNamespacedPod(ns.metadata.name);
      let totalCpu = 0;
      let totalMemory = 0;
      
      for (const pod of pods.body.items) {
        for (const container of pod.spec.containers) {
          if (container.resources?.requests?.cpu) {
            totalCpu += parseCpu(container.resources.requests.cpu);
          }
          if (container.resources?.requests?.memory) {
            totalMemory += parseMemory(container.resources.requests.memory);
          }
        }
      }
      
      if (totalCpu > 0 || totalMemory > 0) {
        namespaceUsage[ns.metadata.name] = {
          cpu: `${totalCpu}m`,
          memory: `${totalMemory}Mi`
        };
      }
    }
    
    return JSON.stringify({
      nodes: nodeUsage,
      namespaces: namespaceUsage
    }, null, 2);
  } catch (error) {
    throw new Error(`Failed to connect to Kubernetes cluster: ${error.message}. Ensure kubectl is configured.`);
  }
}

async function generateHealthReport() {
  try {
    const unhealthyData = await getUnhealthyPods();
    const resourceData = await getResourceUsage();
    
    const unhealthy = JSON.parse(unhealthyData);
    const resources = JSON.parse(resourceData);
    
    const report = `# 🏥 Kubernetes Cluster Health Report

**Generated**: ${new Date().toISOString()}
**Cluster**: mcp-k8s-cluster

## Executive Summary

${unhealthy.unhealthy_count === 0 ? 
  '✅ **All pods are healthy!**' : 
  `⚠️ **${unhealthy.unhealthy_count} unhealthy pods detected**`}

## Pod Health

${unhealthy.unhealthy_count === 0 ? 
  'All pods are running normally with no issues detected.' :
  unhealthy.pods.map(pod => `
### ${pod.name}
- **Namespace**: ${pod.namespace}
- **Status**: ${pod.status}
- **Restarts**: ${pod.restarts}
- **Reason**: ${pod.reason}
- **Age**: ${pod.age}
`).join('\n')}

## Resource Usage

### Nodes
${resources.nodes?.map(node => `
**${node.name}**
- CPU: ${node.cpu_usage}
- Memory: ${node.memory_usage}
- Status: ${node.status}
`).join('\n') || 'No node data available'}

### Top Namespaces by Resource Request
${Object.entries(resources.namespaces || {})
  .sort((a, b) => parseInt(b[1].cpu) - parseInt(a[1].cpu))
  .slice(0, 5)
  .map(([ns, usage]) => `- **${ns}**: CPU ${usage.cpu}, Memory ${usage.memory}`)
  .join('\n') || 'No namespace data available'}

## Recommendations

${unhealthy.unhealthy_count > 0 ? `
1. **Immediate Actions**:
   - Investigate pods in CrashLoopBackOff state
   - Check application logs for error messages
   - Verify resource limits are appropriate

2. **Prevention**:
   - Implement proper health checks
   - Set appropriate resource requests/limits
   - Enable horizontal pod autoscaling
` : `
1. **Optimization Opportunities**:
   - Consider scaling down over-provisioned deployments
   - Review resource requests vs actual usage
   - Enable cluster autoscaling for cost optimization
`}

---
*Report generated by MCP K8s Health Monitor*`;

    return report;
  } catch (error) {
    return `Error generating report: ${error.message}`;
  }
}

// Helper functions
function getAge(timestamp) {
  const now = Date.now();
  const created = new Date(timestamp).getTime();
  const diff = now - created;
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  return `${Math.floor(diff / (1000 * 60))}m`;
}

function parseCpu(cpu) {
  if (cpu.endsWith('m')) {
    return parseInt(cpu);
  }
  return parseInt(cpu) * 1000;
}

function parseMemory(memory) {
  if (memory.endsWith('Mi')) {
    return parseInt(memory);
  }
  if (memory.endsWith('Gi')) {
    return parseInt(memory) * 1024;
  }
  return parseInt(memory) / (1024 * 1024);
}

// Create server
const server = new Server(
  {
    name: 'mcp-k8s-health',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handler for listing tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_unhealthy_pods',
        description: 'List all unhealthy pods in the cluster',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_resource_usage',
        description: 'Get CPU and memory usage across nodes and namespaces',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'generate_health_report',
        description: 'Generate a comprehensive cluster health report',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// Handler for calling tools
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name } = request.params;

  try {
    let result;
    
    switch (name) {
      case 'get_unhealthy_pods':
        result = await getUnhealthyPods();
        break;
      case 'get_resource_usage':
        result = await getResourceUsage();
        break;
      case 'generate_health_report':
        result = await generateHealthReport();
        break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: result
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`
        }
      ]
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP K8s Health Monitor started');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});