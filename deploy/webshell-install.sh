#!/usr/bin/env bash
set -euo pipefail
DOMAIN=7men.puwa.online
SITE_DIR=/var/www/7men
RELEASE=https://github.com/allinnb/qimen/releases/download/v0.3.0-preview/qimen-7men-dist.zip

command -v caddy >/dev/null || { echo '未检测到 Caddy，请先确认玉匣使用的 Web 服务'; exit 1; }
command -v unzip >/dev/null || { apt-get update && apt-get install -y unzip; }

mkdir -p "$SITE_DIR" /etc/caddy/sites
curl -fL "$RELEASE" -o /tmp/qimen-7men.zip
rm -rf "$SITE_DIR"/*
unzip -q /tmp/qimen-7men.zip -d "$SITE_DIR"
cat > /etc/caddy/sites/7men.caddy <<'CADDY'
7men.puwa.online {
	root * /var/www/7men
	encode zstd gzip
	try_files {path} /index.html
	file_server
	header {
		X-Content-Type-Options nosniff
		Referrer-Policy strict-origin-when-cross-origin
	}
}
CADDY
if ! grep -qF 'import /etc/caddy/sites/*.caddy' /etc/caddy/Caddyfile; then
  printf '\nimport /etc/caddy/sites/*.caddy\n' >> /etc/caddy/Caddyfile
fi
caddy fmt --overwrite /etc/caddy/sites/7men.caddy
caddy validate --config /etc/caddy/Caddyfile
systemctl reload caddy
curl -fsS -H "Host: $DOMAIN" http://127.0.0.1/ | grep -q '奇门打工人'
echo "部署完成。请添加 A 记录：7men -> $(curl -fsS https://api.ipify.org || true)"
