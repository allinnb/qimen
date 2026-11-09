#!/usr/bin/env bash
set -euo pipefail
SITE_DIR=/var/www/7men
SNIPPET=/etc/caddy/sites/7men.caddy

install -d -m 755 "$SITE_DIR" /etc/caddy/sites
install -m 644 /tmp/7men-dist/* "$SITE_DIR"/
cp /tmp/7men.caddy "$SNIPPET"

if ! grep -q '^import /etc/caddy/sites/\*\.caddy' /etc/caddy/Caddyfile; then
  printf '\nimport /etc/caddy/sites/*.caddy\n' >> /etc/caddy/Caddyfile
fi

caddy fmt --overwrite "$SNIPPET"
caddy validate --config /etc/caddy/Caddyfile
systemctl reload caddy
curl -fsS -H 'Host: 7men.puwa.online' http://127.0.0.1/ | grep -q '奇门打工人'
echo '7men static site installed and Host-header check passed'
