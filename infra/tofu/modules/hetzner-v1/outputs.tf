output "app_public_ipv4" { value = hcloud_primary_ip.app.ip_address }
output "app_private_ipv4" { value = var.app_private_ip }
output "database_private_ipv4" { value = var.database_private_ip }
