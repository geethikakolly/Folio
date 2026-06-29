module "network" {
  source = "./modules/network"

  name_prefix          = local.name_prefix
  common_tags          = local.common_tags
  vpc_cidr             = var.vpc_cidr
  az_count             = var.az_count
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
}

module "data" {
  source = "./modules/data"

  name_prefix             = local.name_prefix
  common_tags             = local.common_tags
  private_subnet_ids      = module.network.private_subnet_ids
  rds_security_group_id   = module.network.rds_security_group_id
  redis_security_group_id = module.network.redis_security_group_id
  db_name                 = var.db_name
  db_username             = var.db_username
  db_password             = var.db_password
  db_instance_class       = var.db_instance_class
  redis_node_type         = var.redis_node_type
}

module "compute" {
  source = "./modules/compute"

  project_name           = var.project_name
  environment            = var.environment
  name_prefix            = local.name_prefix
  common_tags            = local.common_tags
  aws_region             = var.aws_region
  vpc_id                 = module.network.vpc_id
  public_subnet_ids      = module.network.public_subnet_ids
  private_subnet_ids     = module.network.private_subnet_ids
  alb_security_group_id  = module.network.alb_security_group_id
  ecs_security_group_id  = module.network.ecs_security_group_id
  backend_image          = var.backend_image
  frontend_image         = var.frontend_image
  backend_cpu            = var.backend_cpu
  backend_memory         = var.backend_memory
  frontend_cpu           = var.frontend_cpu
  frontend_memory        = var.frontend_memory
  backend_desired_count  = var.backend_desired_count
  frontend_desired_count = var.frontend_desired_count
  db_name                = var.db_name
  db_username            = var.db_username
  db_password            = var.db_password
  rds_endpoint           = module.data.rds_endpoint
  redis_endpoint         = module.data.redis_endpoint
}
