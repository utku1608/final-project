const express = require('express');
const { Client } = require('pg');
const app = express();
const port = process.env.PORT || 3000;

// Veritabanı bağlantı bilgileri Environment Variable'dan gelecek
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'postgres', // Varsayılan veritabanı
  port: 5432,
  ssl: true
};

app.get('/hello', async (req, res) => {
  const client = new Client(dbConfig);
  try {
    await client.connect();
    // Basit bir sorgu ile bağlantıyı test et
    const result = await client.query('SELECT NOW()');
    await client.end();
    res.send(`Merhaba! Veritabanına başarıyla bağlanıldı. Sunucu Saati: ${result.rows[0].now}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Veritabanı bağlantı hatası: ' + err.message);
  }
});

app.listen(port, () => {
  console.log(`Uygulama ${port} portunda çalışıyor.`);
});