output "app_public_ipv4" { value = hcloud_server.app.ipv4_address }
output "app_private_ipv4" { value = "10.48.1.10" }
output "database_private_ipv4" { value = "10.48.1.20" }
