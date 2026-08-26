terraform { backend "s3" {} }

module "v1" {
  source               = "../../modules/hetzner-v1"
  environment          = "production"
  location             = var.location
  app_server_type      = var.app_server_type
  database_server_type = var.database_server_type
  ssh_keys             = var.ssh_keys
  allowed_ssh_cidrs    = var.allowed_ssh_cidrs
  app_image            = "debian-12"
  database_image       = "debian-12"
  network_ip_range     = var.network_ip_range
  subnet_ip_range      = var.subnet_ip_range
  app_private_ip       = var.app_private_ip
  database_private_ip  = var.database_private_ip
}

variable "location" { type = string }
variable "app_server_type" { type = string }
variable "database_server_type" { type = string }
variable "ssh_keys" { type = set(string) }
variable "allowed_ssh_cidrs" { type = set(string) }
variable "network_ip_range" { type = string }
variable "subnet_ip_range" { type = string }
variable "app_private_ip" { type = string }
variable "database_private_ip" { type = string }
