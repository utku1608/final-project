# Node.js 20 imajını kullan
FROM node:20-bullseye

# SSH sunucusunu kur (Azure gereksinimi)
RUN apt-get update \
    && apt-get install -y --no-install-recommends dialog \
    && apt-get install -y --no-install-recommends openssh-server \
    && echo "root:Docker!" | chpasswd 

# SSH konfigürasyonunu kopyala
COPY sshd_config /etc/ssh/

# Çalışma klasörünü ayarla
WORKDIR /usr/src/app

# Paketleri yükle
COPY package*.json ./
RUN npm install

# Uygulama kodlarını kopyala
COPY . .

# Başlatma scriptini kopyala ve çalıştırma izni ver
COPY init_container.sh /usr/local/bin/
RUN sed -i 's/\r$//' /usr/local/bin/init_container.sh
RUN chmod +x /usr/local/bin/init_container.sh

# Azure App Service SSH Portu (2222) ve Uygulama Portu (3000)
EXPOSE 2222 3000

# Konteyner başladığında çalışacak komut
ENTRYPOINT ["init_container.sh"]