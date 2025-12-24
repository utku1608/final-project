#!/bin/bash
set -e

# SSH servisini başlat
service ssh start

# Node uygulamasını başlat (senin package.json scriptine göre)
npm start