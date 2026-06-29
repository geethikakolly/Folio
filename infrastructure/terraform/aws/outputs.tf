output "alb_dns_name" {
  description = "Public DNS name of the application load balancer"
  value       = module.compute.alb_dns_name
}

output "frontend_url" {
  description = "Frontend URL"
  value       = "http://${module.compute.alb_dns_name}"
}

output "backend_health_url" {
  description = "Backend health endpoint URL"
  value       = "http://${module.compute.alb_dns_name}/api/health"
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = module.compute.ecs_cluster_name
}

output "backend_service_name" {
  description = "Backend ECS service name"
  value       = module.compute.backend_service_name
}

output "frontend_service_name" {
  description = "Frontend ECS service name"
  value       = module.compute.frontend_service_name
}

output "rds_endpoint" {
  description = "PostgreSQL endpoint"
  value       = module.data.rds_endpoint
}

output "redis_endpoint" {
  description = "Redis endpoint"
  value       = module.data.redis_endpoint
}
