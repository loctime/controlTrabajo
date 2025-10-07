#!/bin/bash

# Script para extraer solo los emails de los usuarios exportados
# Útil para enviar lista al equipo de ControlFile

if [ ! -f "users-bolsatrabajo.json" ]; then
    echo "❌ Error: No se encuentra el archivo users-bolsatrabajo.json"
    echo "   Ejecuta primero: ./scripts/export-users.sh"
    exit 1
fi

echo "📧 Extrayendo emails de usuarios..."
echo ""

# Verificar que jq esté instalado
if ! command -v jq &> /dev/null; then
    echo "❌ Error: jq no está instalado"
    echo "📦 Instálalo con:"
    echo "   - macOS: brew install jq"
    echo "   - Ubuntu/Debian: sudo apt-get install jq"
    echo "   - Windows: choco install jq"
    exit 1
fi

# Extraer emails
jq -r '.users[].email' users-bolsatrabajo.json > emails-bolsatrabajo.txt

if [ $? -eq 0 ]; then
    USER_COUNT=$(wc -l < emails-bolsatrabajo.txt)
    echo "✅ ¡Extracción exitosa!"
    echo ""
    echo "📁 Archivo creado: emails-bolsatrabajo.txt"
    echo "👥 Total de emails: $USER_COUNT"
    echo ""
    echo "📋 Primeros 5 emails:"
    head -5 emails-bolsatrabajo.txt
    echo ""
    echo "📧 Puedes enviar este archivo al equipo de ControlFile"
else
    echo "❌ Error durante la extracción"
    exit 1
fi

