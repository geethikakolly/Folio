variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used for resource prefixes"
  type        = string
  default     = "folio"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "dev"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.20.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDRs for public subnets (must match az_count)"
  type        = list(string)
  default     = ["10.20.1.0/24", "10.20.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDRs for private subnets (must match az_count)"
  type        = list(string)
  default     = ["10.20.11.0/24", "10.20.12.0/24"]
}

variable "az_count" {
  description = "How many AZs to use"
  type        = number
  default     = 2
}

variable "backend_image" {
  description = "Container image URI for backend service"
  type        = string
}

variable "frontend_image" {
  description = "Container image URI for frontend service"
  type        = string
}

variable "backend_cpu" {
  description = "Fargate CPU units for backend task"
  type        = number
  default     = 512
}

variable "backend_memory" {
  description = "Fargate memory (MiB) for backend task"
  type        = number
  default     = 1024
}

variable "frontend_cpu" {
  description = "Fargate CPU units for frontend task"
  type        = number
  default     = 256
}

variable "frontend_memory" {
  description = "Fargate memory (MiB) for frontend task"
  type        = number
  default     = 512
}

variable "backend_desired_count" {
  description = "Desired task count for backend service"
  type        = number
  default     = 2
}

variable "frontend_desired_count" {
  description = "Desired task count for frontend service"
  type        = number
  default     = 2
}

variable "db_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "folio_db"
}

variable "db_username" {
  description = "PostgreSQL master username"
  type        = string
  default     = "folio"
}

variable "db_password" {
  description = "PostgreSQL master password"
  type        = string
  sensitive   = true
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t4g.micro"
}

variable "redis_node_type" {
  description = "ElastiCache Redis node type"
  type        = string
  default     = "cache.t4g.micro"
}

variable "resource_tags" {
  description = "Additional tags to apply to all resources"
  type        = map(string)
  default     = {}
}
