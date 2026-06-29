# Terraform State Incident Runbook Checklist

Use this checklist when Terraform state appears broken, missing, or out-of-sync with AWS resources.

## 0) Scope and Safety
- [ ] Confirm impacted environment (`dev`, `stage`, `prod`)
- [ ] Freeze all applies (Jenkins + local)
- [ ] Assign one incident owner
- [ ] Open incident channel and timestamp all actions

## 1) Quick Symptoms Check
- [ ] `terraform plan` shows massive unexpected creates/destroys
- [ ] Backend/state errors during init/plan
- [ ] Known AWS resources not reflected in state
- [ ] Duplicate-name errors on apply (state likely missing entries)

## 2) Collect Diagnostics (Read-Only)
From Terraform root: `infrastructure/terraform/aws`

```bash
terraform version
terraform init -reconfigure -backend-config=backend-<env>.hcl
terraform state list || true
terraform state pull > state-pull-$(date +%Y%m%d-%H%M%S).json || true
terraform plan -refresh-only -var-file=terraform.<env>.tfvars || true
```

- [ ] Save outputs/logs to incident notes
- [ ] Keep pulled state snapshots safe

## 3) Containment
- [ ] Keep applies disabled until root cause understood
- [ ] Enforce single-writer policy
- [ ] Confirm no concurrent Jenkins jobs are active

Optional checks:

```bash
# Verify no apply is running in CI (example command pattern)
# Check your Jenkins UI / build queue for active Terraform jobs
```

## 4) Decide Recovery Path
Choose one primary path:

### Path A: Restore Known-Good Backend State (Preferred)
Use when a valid previous state version exists.
- [ ] Identify last good state object version in S3
- [ ] Restore/rollback state object
- [ ] Re-run `terraform init -reconfigure`
- [ ] Run `terraform plan` and verify expected diff

### Path B: Rebuild State by Importing Existing Resources
Use when state is missing/corrupt and restore is not viable.
- [ ] Import critical resources first
- [ ] Iterate until plan is stable

Import pattern:

```bash
terraform import <resource_address> <aws_resource_id>
```

High-priority import order:
1. ALB and target groups
2. ECS cluster and services
3. RDS instance
4. ElastiCache cluster
5. Networking primitives if absent

## 5) Common Commands (Recovery)

```bash
# Reinitialize backend safely
terraform init -reconfigure -backend-config=backend-<env>.hcl

# Compare plan after recovery step
terraform plan -var-file=terraform.<env>.tfvars

# Remove incorrect state entry (only if intentional and reviewed)
terraform state rm <resource_address>

# Refresh-only update (metadata alignment without infra changes)
terraform apply -refresh-only -var-file=terraform.<env>.tfvars
```

## 6) Validate Before Re-Enabling Apply
- [ ] `terraform validate` passes
- [ ] `terraform plan` shows expected/no-op or approved changes only
- [ ] Peer review completed for state actions (restore/import/rm)
- [ ] Incident owner signs off

## 7) Re-Enable Delivery Safely
- [ ] Re-enable Jenkins apply stage
- [ ] Run one controlled apply
- [ ] Confirm outputs/health endpoints

Validation:

```bash
terraform output
terraform output frontend_url
terraform output backend_health_url
```

## 8) Post-Incident Actions
- [ ] Document root cause and exact timeline
- [ ] Add guardrails (approval gates, single writer policy, CI checks)
- [ ] Improve backup/restore playbook for state backend
- [ ] Add drift detection cadence (scheduled `terraform plan`)

## Red Flags (Stop and Escalate)
- [ ] Plan proposes destructive changes to unrelated resources
- [ ] State file restored but plan still nonsensical
- [ ] Imports repeatedly conflict or map to wrong resources
- [ ] Multiple operators applying simultaneously

## Notes Template
- Environment:
- Start time:
- Incident owner:
- Symptoms:
- Chosen recovery path (A/B):
- Commands executed:
- Outcome:
- Follow-ups:
