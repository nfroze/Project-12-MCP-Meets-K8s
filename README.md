# 👑 Project 12: MCP Meets K8s

AI-Powered Kubernetes Operations with Enterprise Security

## 🚀 Overview

This project demonstrates a complete DevSecOps pipeline featuring:
- **Security-first infrastructure** deployed to AWS EKS
- **Comprehensive security scanning** (SAST, SCA, Secrets, IaC)
- **GitOps deployment** via ArgoCD
- **Full observability** with Prometheus/Grafana
- **AI-powered cluster operations** using Claude MCP (Model Context Protocol)

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
- ✅ **SBOM generation** for supply chain visibility

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

## 🚀 Quick Start

### 1. Infrastructure Deployment

```bash
# Review security scan results in GitHub Actions first!

cd terraform
terraform init
terraform plan
terraform apply

# Configure kubectl
aws eks update-kubeconfig --region eu-west-2 --name mcp-k8s-cluster
```

### 2. Install ArgoCD

```bash
kubectl create namespace argocd
helm repo add argo https://argoproj.github.io/argo-helm
helm install argocd argo/argo-cd -n argocd

# Get admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

### 3. Install Monitoring Stack

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install monitoring prometheus-community/kube-prometheus-stack
```

## 📊 Accessing Services

```bash
# ArgoCD UI
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Grafana
kubectl port-forward svc/monitoring-grafana 3000:80

# Application
kubectl port-forward svc/mcp-k8s-app 8000:80
```

## 🤖 MCP Integration

The MCP server enables natural language queries like:
- "What pods are unhealthy?"
- "Show me resource usage"
- "Generate a cluster health report"

## 💰 Cost Optimization

This entire project runs for under $5:
- Single NAT gateway
- t3.medium instances
- Aggressive auto-scaling policies

## 🎯 Project Goals

1. **Demonstrate DevSecOps best practices** with security scanning at every stage
2. **Showcase modern deployment patterns** using GitOps and Kubernetes
3. **Pioneer AI operations** with one of the first MCP Kubernetes integrations
4. **Prove that learning doesn't require expensive resources** - built for under $5

## 📈 Results

- 🔒 **100% security gate compliance**
- 🚀 **4-hour build time**
- 💰 **Under $5 total cost**
- 🤖 **First-of-its-kind MCP integration**

## 🧑‍💻 Author

**Noah Frost** - Former Police Constable turned DevSecOps Engineer

- 11 production-ready projects in 3 months
- Self-taught with zero mentorship
- From protecting streets to protecting cloud infrastructure

## 📝 License

This project is open source and available under the [MIT License](LICENSE).