variable "environment" { type = string }
variable "location" { type = string }
variable "app_server_type" { type = string }
variable "ssh_keys" { type = set(string) }
variable "allowed_ssh_cidrs" { type = set(string) }
variable "app_image" { type = string }
variable "edge_source_cidrs" { type = set(string) }
variable "app_primary_ip_delete_protection" { type = bool }
