# Jenkins + Terraform Deployment Guide

This guide explains how to run Folio Terraform provisioning from Jenkins with remote state in S3 (S3-only backend).

## Files Added
- [Jenkinsfile](Jenkinsfile)
- [infrastructure/terraform/aws/backend-dev.hcl.example](infrastructure/terraform/aws/backend-dev.hcl.example)
- [infrastructure/terraform/aws/backend-stage.hcl.example](infrastructure/terraform/aws/backend-stage.hcl.example)
- [infrastructure/terraform/aws/backend-prod.hcl.example](infrastructure/terraform/aws/backend-prod.hcl.example)

Terraform backend is enabled in:
- [infrastructure/terraform/aws/versions.tf](infrastructure/terraform/aws/versions.tf)

## One-Time Setup Per Environment
Create backend files from examples and set your real values.

```bash
cd infrastructure/terraform/aws
cp backend-dev.hcl.example backend-dev.hcl
cp backend-stage.hcl.example backend-stage.hcl
cp backend-prod.hcl.example backend-prod.hcl
```

Each backend file should point to:
- an existing S3 bucket for Terraform state

## Jenkins Job Configuration
Create a Pipeline job pointing to this repository and `Jenkinsfile`.

Pipeline parameters:
- `ENVIRONMENT`: `dev`, `stage`, `prod`
- `TF_VARS_FILE`: e.g. `terraform.dev.tfvars`
- `APPLY`: `false` for plan-only, `true` for plan+apply

Expected repo file layout for vars:
- `infrastructure/terraform/aws/terraform.dev.tfvars`
- `infrastructure/terraform/aws/terraform.stage.tfvars`
- `infrastructure/terraform/aws/terraform.prod.tfvars`

## What the Pipeline Does
1. Checkout source
2. `terraform init` with `backend-${ENVIRONMENT}.hcl`
3. `terraform fmt -check`
4. `terraform validate`
5. `terraform plan -out=tfplan`
6. Archive `tfplan.txt`
7. Manual approval gate for `stage`/`prod` when `APPLY=true`
8. `terraform apply tfplan` (only when `APPLY=true`)
9. Archive Terraform outputs as `tf_outputs.json`

## Recommended Credential Model
Preferred:
- Jenkins agents run with an IAM role that can access target AWS resources and Terraform state bucket.

Alternative:
- Use Jenkins credentials for AWS keys and inject via environment.

## Minimal IAM Permissions
The principal used by Jenkins should have permissions for:
- S3 state bucket read/write
- ECS, ELB, EC2 networking, IAM role operations used by this stack
- RDS and ElastiCache provisioning
- CloudWatch Logs

## Runbook
Plan-only (safe):
- `ENVIRONMENT=dev`
- `TF_VARS_FILE=terraform.dev.tfvars`
- `APPLY=false`

Apply:
- `ENVIRONMENT=dev`
- `TF_VARS_FILE=terraform.dev.tfvars`
- `APPLY=true`

For stage/prod apply, Jenkins prompts for manual approval.

## Troubleshooting
- `Missing backend-<env>.hcl`
  - Create file from `.example` and fill values.
- `terraform: command not found`
  - Install Terraform on Jenkins agent.
- Concurrent apply risk
  - Keep a single writer policy (Jenkins only), keep `disableConcurrentBuilds()`, and avoid running local `terraform apply` against the same state.
- Access denied on state bucket
  - Verify IAM policy includes S3 object read/write and bucket list.
