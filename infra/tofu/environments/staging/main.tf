terraform { backend "s3" {} }

module "v1" {
  source                            = "../../modules/hetzner-v1"
  environment                       = "staging"
  location                          = var.location
  app_server_type                   = var.app_server_type
  ssh_keys                          = var.ssh_keys
  allowed_ssh_cidrs                 = var.allowed_ssh_cidrs
  app_image                         = "debian-12"
  edge_source_cidrs                 = var.edge_source_cidrs
  app_primary_ip_delete_protection = false
}

variable "location" { type = string }
variable "app_server_type" { type = string }
variable "ssh_keys" { type = set(string) }
variable "allowed_ssh_cidrs" { type = set(string) }
variable "edge_source_cidrs" { type = set(string) }

output "app_public_ipv4" { value = module.v1.app_public_ipv4 }
