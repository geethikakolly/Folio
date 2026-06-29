# Interview STAR Script: Terraforming Folio on AWS

Use this as a polished speaking script. Keep answers in 60-120 seconds unless asked for more depth.

## STAR Story 1: End-to-End Cloud Provisioning

### Situation
I had a containerized full-stack app, Folio, running locally with Docker Compose, and I needed to move it to AWS in a reproducible way that was easy to explain and operate.

### Task
My goal was to provision production-style infrastructure with Infrastructure as Code, so anyone could deploy the stack consistently and safely without manual console steps.

### Action
I designed and implemented a Terraform stack under [infrastructure/terraform/aws](infrastructure/terraform/aws) with clear separation of concerns.
- Networking: VPC, public/private subnets across AZs, internet and NAT gateways, and route tables
- Security: dedicated security groups for ALB, ECS services, RDS, and Redis using least-privilege paths
- Compute: ECS Fargate cluster with separate frontend and backend services
- Data: RDS PostgreSQL and ElastiCache Redis in private subnets
- Ingress: ALB path-based routing where `/api*` goes to backend and all other routes go to frontend
- Operations: CloudWatch log groups and Terraform outputs for quick verification
I also created a practical runbook with init/plan/apply/destroy and troubleshooting steps.

### Result
I converted a manually operated local setup into an automated AWS deployment workflow that is repeatable, reviewable in code, and much faster for onboarding. It reduced deployment ambiguity and gave us a clear path to production hardening like HTTPS, Secrets Manager, and autoscaling.

---

## STAR Story 2: Reliability and Traceability Focus

### Situation
The project had many moving parts: app containers, database, cache, networking, and load balancing. Manual provisioning risked drift, misconfiguration, and hard-to-debug incidents.

### Task
I needed to build infrastructure that was both reliable and observable, while keeping it understandable for a learning-focused team.

### Action
I made Terraform the source of truth and encoded dependencies in a deterministic order:
1. network and routing,
2. security boundaries,
3. data services,
4. ECS services behind ALB.
I ensured backend service configuration was injected from provisioned resources (RDS endpoint, Redis endpoint), and exposed health URLs as Terraform outputs for fast validation. I also documented operational commands for rollout and cleanup.

### Result
Provisioning became consistent across runs, changes became auditable in pull requests, and operational verification became faster using generated outputs and log groups. This improved confidence during deployments and reduced time spent on environment setup.

---

## STAR Story 3: Leadership and Decision-Making

### Situation
We needed to move quickly, but also avoid overengineering in an early phase.

### Task
I had to choose an architecture that delivered value now while preserving a clean upgrade path to production-grade controls.

### Action
I intentionally implemented a minimal viable cloud baseline first: ECS Fargate + ALB + RDS + Redis + CloudWatch, with strong defaults and parameterized sizing. I documented explicit next-step upgrades: HTTPS/ACM, Secrets Manager, remote Terraform state, autoscaling, and WAF.

### Result
The team got a working AWS deployment quickly, and we kept technical debt visible and manageable with a clear hardening roadmap.

---

## STAR Story 4: Making a Pragmatic Backend-State Tradeoff (S3-Only)

### Situation
We needed remote Terraform state quickly for Jenkins-based deployments, but we did not have a broader DynamoDB use case and wanted to avoid adding operational complexity too early.

### Task
I had to choose a state backend approach that improved team workflow immediately while still being transparent about risks and next-step hardening.

### Action
I implemented an S3-only Terraform backend for dev/stage/prod backend config templates and documented strict controls:
- single writer model through Jenkins
- `disableConcurrentBuilds()` in pipeline
- no local `terraform apply` against shared state
- clear runbook and troubleshooting guidance
I also documented the explicit upgrade trigger: if concurrency increases, move to DynamoDB locking or Terraform Cloud.

### Result
We got remote state benefits immediately with minimal setup and no workflow disruption. At the same time, risk was managed through process controls, and we preserved a clean path to stronger state locking when team scale demands it.

---

## STAR Story 5: Refactoring Terraform into Modules

### Situation
As the AWS stack grew, a single root Terraform module became harder to navigate and explain in reviews and interviews.

### Task
I needed to improve maintainability and reuse without changing deployed behavior.

### Action
I split the infrastructure into child modules and kept a thin root orchestration layer:
- `modules/network` for VPC, subnets, routing, and security groups
- `modules/data` for RDS and Redis
- `modules/compute` for ALB, ECS cluster, task definitions, and services
I exposed clear module outputs and consumed them through `modules.tf` in the root module.

### Result
The code became easier to reason about, onboarding got faster, and change impact became more isolated. It also created a clean path to reusing the same module set across environments.

---

## 30-Second Version (Elevator Answer)
I took a Docker Compose-based full-stack app and codified its AWS deployment with Terraform. I provisioned VPC networking, ALB routing, ECS Fargate services, RDS PostgreSQL, Redis, IAM, and CloudWatch logging. The key impact was repeatable, reviewable deployments with less manual risk, plus a clear path to production upgrades like HTTPS, secrets management, and autoscaling.

## Interview Follow-Up Prompts and Strong Responses

### Q: Why ECS Fargate instead of EKS?
For this stage, Fargate minimized operational overhead and got us to value faster. We can evolve to EKS if we need Kubernetes-native controls later.

### Q: How did you handle security?
I isolated services in private subnets, put ALB in public subnets, and used targeted security group rules so only required traffic paths are open.

### Q: What would you improve next?
HTTPS with ACM, Secrets Manager for DB credentials, stronger state locking (DynamoDB or Terraform Cloud) if concurrent writers increase, ECS autoscaling, and WAF in front of ALB.

### Q: How do you roll out a new backend image?
Update image tag in `terraform.tfvars`, then run `terraform plan` and `terraform apply`. Terraform updates task definitions and ECS performs rolling replacement.

### Q: What is the advantage of Terraform modules?
Modules improve reuse, readability, and ownership boundaries. Instead of one large root config, each domain (network, data, compute) has an isolated implementation and output contract. That reduces review complexity, speeds onboarding, and makes future environment expansion simpler.

### Q: How do you validate Terraform safely without creating resources?
I use a two-step process: `terraform fmt -check` plus `terraform validate` for static checks, and then `terraform plan` as a dry run. For backend-isolated local testing, I initialize with backend disabled in a temporary copy so state is never touched.

### Q: What if Terraform state is corrupted?
First I freeze all applies, back up current state, and recover from the latest known-good backend version. Then I run `terraform init -reconfigure`, inspect plan output, and repair resource mappings with `terraform import` where needed. I avoid ad-hoc state edits unless there is no safer option.

### Q: What happens if state is missing but resources exist in AWS?
Terraform will think resources do not exist and plan to create them. That can fail with duplicate-name conflicts or create parallel infrastructure. The safe fix is to recover state or import existing resources into state before any apply.
