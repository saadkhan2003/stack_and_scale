resource "hcloud_network" "v1" {
  name     = "stack-and-scale-${var.environment}"
  ip_range = var.network_ip_range
}

resource "hcloud_network_subnet" "v1" {
  network_id   = hcloud_network.v1.id
  type         = "cloud"
  network_zone = "eu-central"
  ip_range     = var.subnet_ip_range
}

data "hcloud_ssh_key" "selected" {
  for_each = var.ssh_keys
  name     = each.value
}

locals {
  ssh_public_keys = [for key in data.hcloud_ssh_key.selected : key.public_key]
}

resource "hcloud_firewall" "app" {
  name = "stack-and-scale-${var.environment}-app"
  rule { direction = "in" protocol = "tcp" port = "80" source_ips = ["0.0.0.0/0", "::/0"] }
  rule { direction = "in" protocol = "tcp" port = "443" source_ips = ["0.0.0.0/0", "::/0"] }
  dynamic "rule" {
    for_each = var.allowed_ssh_cidrs
    content { direction = "in" protocol = "tcp" port = "22" source_ips = [rule.value] }
  }
}

resource "hcloud_firewall" "database" {
  name = "stack-and-scale-${var.environment}-database"
  rule { direction = "in" protocol = "tcp" port = "5432" source_ips = [var.subnet_ip_range] }
  dynamic "rule" {
    for_each = var.allowed_ssh_cidrs
    content { direction = "in" protocol = "tcp" port = "22" source_ips = [rule.value] }
  }
}

resource "hcloud_server" "app" {
  name         = "stack-and-scale-${var.environment}-app"
  server_type  = var.app_server_type
  image        = var.app_image
  location     = var.location
  ssh_keys     = var.ssh_keys
  firewall_ids = [hcloud_firewall.app.id]
  backups      = true
  user_data = templatefile("${path.module}/cloud-init-app.yaml.tftpl", {
    ssh_public_keys = local.ssh_public_keys
  })
  network { network_id = hcloud_network.v1.id ip = var.app_private_ip }
  depends_on = [hcloud_network_subnet.v1]
  labels = { application = "stack-and-scale", environment = var.environment, role = "app" }
}

resource "hcloud_server" "database" {
  name         = "stack-and-scale-${var.environment}-database"
  server_type  = var.database_server_type
  image        = var.database_image
  location     = var.location
  ssh_keys     = var.ssh_keys
  firewall_ids = [hcloud_firewall.database.id]
  backups      = true
  user_data = templatefile("${path.module}/cloud-init-database.yaml.tftpl", {
    ssh_public_keys = local.ssh_public_keys
  })
  network { network_id = hcloud_network.v1.id ip = var.database_private_ip }
  depends_on = [hcloud_network_subnet.v1]
  labels = { application = "stack-and-scale", environment = var.environment, role = "database" }
}
