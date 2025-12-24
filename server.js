const express = require('express');
const { Client } = require('pg');
const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");

const app = express();
const port = process.env.PORT || 3000;

// Key Vault Adını buraya yaz (veya env'den al)
const keyVaultName = "kv-utkuderici-01"; // <-- SENİN KEY VAULT ADIN
const keyVaultUrl = `https://${keyVaultName}.vault.azure.net`;

// Veritabanı yapılandırmasını tutacak değişken
let dbConfig = null;

async function getSecrets() {
  try {
    // 1. Azure Kimliği ile bağlan (Managed Identity otomatik kullanılır)
    const credential = new DefaultAzureCredential();
    const client = new SecretClient(keyVaultUrl, credential);

    console.log("Key Vault'tan sırlar çekiliyor...");

    // 2. Secret'ları tek tek çek (Azure Key Vault'ta bu isimlerle kayıtlı olmalı)
    const hostSecret = await client.getSecret("DbHost");
    const userSecret = await client.getSecret("DbUser");
    const passwordSecret = await client.getSecret("DbPassword");

    // 3. Konfigürasyonu oluştur
    dbConfig = {
      host: hostSecret.value,
      user: userSecret.value,
      password: passwordSecret.value,
      database: 'postgres',
      port: 5432,
      ssl: { rejectUnauthorized: false }
    };
    
    console.log("Sırlar başarıyla alındı!");
  } catch (err) {
    console.error("Key Vault hatası:", err.message);
    process.exit(1); // Şifre yoksa uygulama çalışmasın
  }
}

// Ana sayfa
app.get('/', (req, res) => {
  res.send('Sunucu çalışıyor! (SDK ile Key Vault Bağlantılı)');
});

// Veritabanı testi
app.get('/hello', async (req, res) => {
  if (!dbConfig) {
    return res.status(500).send("Veritabanı ayarları yüklenemedi.");
  }

  const client = new Client(dbConfig);
  try {
    await client.connect();
    const result = await client.query('SELECT NOW()');
    await client.end();
    res.send(`Merhaba! Veritabanına başarıyla bağlanıldı. Sunucu Saati: ${result.rows[0].now}`);
  } catch (err) {
    console.error("DB HATA:", err);
    res.status(500).send('Veritabanı bağlantı hatası: ' + err.message);
  }
});

// Sunucuyu başlatmadan önce Secret'ları bekle
async function startServer() {
  await getSecrets(); // Önce şifreleri al
  app.listen(port, () => {
    console.log(`Uygulama ${port} portunda çalışıyor.`);
  });
}

startServer();