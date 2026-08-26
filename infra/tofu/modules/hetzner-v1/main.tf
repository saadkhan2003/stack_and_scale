data "hcloud_ssh_key" "selected" {
  for_each = var.ssh_keys
  name     = each.value
}

locals {
  ssh_public_keys = [for key in data.hcloud_ssh_key.selected : key.public_key]
}

resource "hcloud_firewall" "app" {
  name = "stack-and-scale-${var.environment}-app"
  dynamic "rule" {
    for_each = var.edge_source_cidrs
    content { direction = "in" protocol = "tcp" port = "80" source_ips = [rule.value] }
  }
  dynamic "rule" {
    for_each = var.edge_source_cidrs
    content { direction = "in" protocol = "tcp" port = "443" source_ips = [rule.value] }
  }
  dynamic "rule" {
    for_each = var.allowed_ssh_cidrs
    content { direction = "in" protocol = "tcp" port = "22" source_ips = [rule.value] }
  }
}

resource "hcloud_primary_ip" "app" {
  name              = "stack-and-scale-${var.environment}-app-ipv4"
  type              = "ipv4"
  location          = var.location
  assignee_type     = "server"
  auto_delete       = false
  delete_protection = var.app_primary_ip_delete_protection
  labels            = { application = "stack-and-scale", environment = var.environment, role = "app" }
}

resource "hcloud_server" "app" {
  name         = "stack-and-scale-${var.environment}-app"
  server_type  = var.app_server_type
  image        = var.app_image
  location     = var.location
  ssh_keys     = var.ssh_keys
  firewall_ids = [hcloud_firewall.app.id]
  backups      = true
  public_net {
    ipv4_enabled = true
    ipv4         = hcloud_primary_ip.app.id
    ipv6_enabled = false
  }
  user_data = templatefile("${path.module}/cloud-init-app.yaml.tftpl", {
    ssh_public_keys = local.ssh_public_keys
  })
  labels = { application = "stack-and-scale", environment = var.environment, role = "app" }
}
