# 👑 Project 12: MCP Meets K8s

AI-Powered Kubernetes Operations with Enterprise Security

## TLDR

Built a production-grade DevSecOps platform demonstrating true shift-left security with automated scanning at every stage. Deployed containerized applications to AWS EKS using GitOps principles, with ArgoCD managing deployments from Git commits. Integrated comprehensive observability through Prometheus and Grafana for real-time metrics and alerting. 

**The innovation**: Pioneered one of the first Kubernetes MCP (Model Context Protocol) integrations, enabling natural language queries like "What's broken in my cluster?" directly in Claude Desktop. From infrastructure provisioning to AI-powered operations, every component is security-scanned, automatically deployed, and monitored.

**[📝 K8s Summary](docs/summary.md)**
  
**[🗂️ K8s Full Report](docs/report.md)**

## 🚀 Overview

This project demonstrates a complete DevSecOps pipeline featuring:
- **Security-first infrastructure** deployed to AWS EKS
- **Comprehensive security scanning** (SAST, SCA, Secrets, IaC)
- **GitOps deployment** via ArgoCD
- **Full observability** with Prometheus/Grafana
- **AI-powered cluster operations** using Claude MCP (Model Context Protocol)

## 📸 Project Screenshots

### 🤖 MCP Integration in Action

![Claude Summary Prompt](Screenshots/1.png)
*Natural language query to Claude asking for cluster health summary - MCP server connects and provides instant insights*

![Claude Full Report Prompt](Screenshots/2.png)
*Comprehensive cluster analysis generated through MCP, including cost optimization recommendations and KPI frameworks*

### 🚀 Live Applications

![Live Webapp](Screenshots/3.png)
*Project 12 dashboard showcasing the complete DevSecOps pipeline with MCP integration prominently featured*

![ArgoCD Dashboard](Screenshots/4.png)
*ArgoCD managing both applications via GitOps - showing healthy and synced status for continuous deployment*

![Grafana Dashboard](Screenshots/5.png)
*Real-time cluster metrics visualization showing resource utilization across namespaces with Prometheus data*

## 🏗️ Architecture

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

## 🔒 Security Controls

- ✅ **Infrastructure as Code** scanned with Checkov
- ✅ **Application code** analyzed with Semgrep
- ✅ **Secrets detection** via Gitleaks
- ✅ **Container security** with Trivy
- ✅ **Automated deployment** if all scans pass

## 🛠️ Tech Stack

- **Cloud**: AWS EKS (eu-west-2)
- **IaC**: Terraform
- **CI/CD**: GitHub Actions
- **GitOps**: ArgoCD
- **Monitoring**: Prometheus + Grafana
- **AI**: Claude MCP Server
- **Security**: Checkov, Semgrep, Trivy, Gitleaks

## 📋 Prerequisites

- AWS Account with appropriate permissions
- AWS CLI configured
- Terraform >= 1.6.0
- kubectl
- Docker
- Helm 3
- Node.js >= 18

## 🚀 Deployment Guide

### 1. Infrastructure Deployment

```bash
# Clone the repository
git clone https://github.com/nfroze/Project-12-MCP-Meets-K8s.git
cd Project-12-MCP-Meets-K8s

# Deploy infrastructure
cd terraform
terraform init
terraform plan
terraform apply

# Configure kubectl
aws eks update-kubeconfig --region eu-west-2 --name mcp-k8s-cluster
```

### 2. Application Deployment

The application pipeline automatically:
- Scans code with Semgrep
- Checks for secrets with Gitleaks
- Scans dependencies with Trivy
- Builds and pushes to DockerHub

### 3. Install ArgoCD

```bash
# Install ArgoCD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Get admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Make ArgoCD publicly accessible
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "LoadBalancer"}}'
```

### 4. Deploy Applications via GitOps

```bash
# Deploy your app
kubectl apply -f k8s/argocd-app.yaml

# Deploy monitoring stack
kubectl apply -f k8s/monitoring.yaml
```

### 5. Install Metrics Server (for MCP)

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

### 6. Configure MCP Server

1. Install dependencies:
```bash
cd mcp-server
npm install
```

2. Add to Claude Desktop config (`%APPDATA%\Claude\claude_desktop_config.json`):
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

3. Restart Claude Desktop

## 📊 Accessing Services

All services are publicly accessible via AWS LoadBalancers:

- **ArgoCD**: `https://[your-argocd-lb].elb.amazonaws.com`
- **Grafana**: `http://[your-grafana-lb].elb.amazonaws.com` (admin/prom-operator)
- **Application**: `http://[your-app-lb].elb.amazonaws.com`

## 🤖 MCP Integration

The MCP server enables natural language queries:
- "What pods are unhealthy?"
- "Show me resource usage"
- "Generate a cluster health report"
- "Which namespace is using the most CPU?"

## 💰 Cost Optimization

This entire project runs for under $5/hour:
- t3.medium instances (2 nodes)
- Single NAT gateway
- Temporary LoadBalancers for demo

**Remember to destroy resources after demo:**
```bash
terraform destroy
```

## 🎯 Project Achievements

1. **Security First**: Every commit scanned, every image verified
2. **True GitOps**: All deployments tracked in Git
3. **AI Operations**: Natural language cluster management
4. **Production Ready**: Same patterns used in enterprise
5. **Cost Effective**: Full platform under $5

## 📸 Screenshots

- Infrastructure security scan passing
- Application security pipeline
- ArgoCD managing deployments
- Grafana showing cluster metrics
- MCP querying cluster health

## 🧑‍💻 Author

**Noah Frost** - Former Police Constable turned DevSecOps Engineer

- 12 production-ready projects in 3 months
- Self-taught with zero mentorship
- From protecting streets to protecting cloud infrastructure

## 📝 License

This project is open source and available under the [MIT License](LICENSE).