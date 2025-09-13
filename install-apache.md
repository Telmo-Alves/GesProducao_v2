# Instalação e Configuração Apache

## 1. Instalar módulos necessários

```bash
# Ativar módulos do Apache
sudo a2enmod rewrite
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod headers
sudo a2enmod expires
sudo a2enmod deflate
```

## 2. Configurar Virtual Host

```bash
# Copiar configuração
sudo cp gesproducao.conf /etc/apache2/sites-available/

# Ativar o site
sudo a2ensite gesproducao

# Desativar site padrão (opcional)
sudo a2dissite 000-default

# Reiniciar Apache
sudo systemctl restart apache2
```

## 3. Configurar DNS ou hosts

No servidor DNS ou no `/etc/hosts` (se necessário):
```
# IP do servidor webserver.webolution.lan
10.0.0.X webserver.webolution.lan
10.0.0.X gesproducao.webolution.lan
```

## 4. Configurar permissões

```bash
# Definir proprietário correto
sudo chown -R www-data:www-data /var/www/html/gesproducao_v2/

# Definir permissões
sudo chmod -R 755 /var/www/html/gesproducao_v2/
sudo chmod -R 777 /var/www/html/gesproducao_v2/uploads/ # se existir pasta uploads
```

## 5. PM2 para o Node.js (produção)

```bash
# Instalar PM2
npm install -g pm2

# Criar ecosystem file
pm2 init simple

# Editar ecosystem.config.js
module.exports = {
  apps: [{
    name: 'gesproducao-api',
    script: 'dist/server.js',
    cwd: '/var/www/html/gesproducao_v2',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};

# Iniciar aplicação
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 6. Logs

```bash
# Logs Apache
sudo tail -f /var/log/apache2/gesproducao_error.log
sudo tail -f /var/log/apache2/gesproducao_access.log

# Logs Node.js (PM2)
pm2 logs gesproducao-api
```

## 7. Firewall (se necessário)

```bash
# Permitir HTTP e HTTPS
sudo ufw allow 'Apache Full'
```

## 8. SSL (opcional)

Para SSL com Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-apache
sudo certbot --apache -d webserver.webolution.lan -d gesproducao.webolution.lan
```