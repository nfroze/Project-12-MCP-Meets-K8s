# Project 12: MCP Meets K8s

## Overview

Model Context Protocol server for Kubernetes operations. AWS EKS cluster with ArgoCD GitOps deployment. Prometheus and Grafana monitoring. Security scanning with Checkov, Semgrep, Gitleaks, and Trivy.

## Architecture

```
├── Infrastructure (Terraform)
│   ├── EKS Cluster
│   ├── VPC & Networking
│   └── IAM/IRSA Configuration
│
├── Security Pipeline
│   ├── Checkov (IaC scanning)
│   ├── Semgrep (SAST)
│   ├── Gitleaks (Secret detection)
│   └── Trivy (Container & SCA)
│
├── GitOps (ArgoCD)
│   ├── Automated deployments
│   └── Git-based source of truth
│
└── MCP Integration
    └── Natural language K8s queries
```

## Technologies

- Cloud: AWS EKS (eu-west-2)
- IaC: Terraform
- CI/CD: GitHub Actions
- GitOps: ArgoCD
- Monitoring: Prometheus + Grafana
- AI: Claude MCP Server
- Security: Checkov, Semgrep, Trivy, Gitleaks

## Implementation

### Infrastructure Deployment

```bash
cd terraform
terraform init
terraform plan
terraform apply

aws eks update-kubeconfig --region eu-west-2 --name mcp-k8s-cluster
```

### ArgoCD Installation

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "LoadBalancer"}}'
```

### Application Deployment

```bash
kubectl apply -f k8s/argocd-app.yaml
kubectl apply -f k8s/monitoring.yaml
```

### Metrics Server

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

### MCP Server Configuration

Install dependencies:
```bash
cd mcp-server
npm install
```

Add to Claude Desktop config (`%APPDATA%\Claude\claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "k8s-health": {
      "command": "node",
      "args": ["C:/path/to/mcp-server/index.js"],
      "env": {
        "KUBECONFIG": "C:/Users/[YourName]/.kube/config"
      }
    }
  }
}
```

## Features

### Security Scanning
- Infrastructure as Code scanning with Checkov
- Application code analysis with Semgrep
- Secret detection via Gitleaks
- Container security with Trivy

### GitOps Workflow
- ArgoCD manages deployments from Git
- Automated synchronisation
- Application health monitoring

### MCP Integration
The MCP server enables natural language queries:
- Pod health status
- Resource usage information
- Cluster health reports
- Namespace resource consumption

### Monitoring
- Prometheus metrics collection
- Grafana dashboards
- Real-time resource visualisation

## Screenshots

1. [Natural language query to Claude for cluster health summary](screenshots/1.png)
2. [Comprehensive cluster analysis through MCP](screenshots/2.png)
3. [Project dashboard with DevSecOps pipeline](screenshots/3.png)
4. [ArgoCD managing applications via GitOps](screenshots/4.png)
5. [Grafana dashboard showing cluster metrics](screenshots/5.png)

## Generated Documents

- [K8s Summary](documents/summary.md)
- [K8s Full Report](documents/report.md)


## Prerequisites

- AWS Account
- AWS CLI configured
- Terraform >= 1.6.0
- kubectl
- Docker
- Helm 3
- Node.js >= 18

## Project Structure

```
Project-12-MCP-Meets-K8s/
├── terraform/          # Infrastructure as Code
├── mcp-server/        # MCP server implementation
├── k8s/               # Kubernetes manifests
├── .github/workflows/ # CI/CD pipelines
└── screenshots/       # Documentation images
```