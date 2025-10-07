#!/bin/bash

# Script para exportar usuarios de Firebase Authentication
# Este script facilita la exportación de usuarios para migrar a ControlFile

echo "🔄 Exportando usuarios de Firebase Authentication..."
echo ""

# Verificar que Firebase CLI esté instalado
if ! command -v firebase &> /dev/null; then
    echo "❌ Error: Firebase CLI no está instalado"
    echo "📦 Instálalo con: npm install -g firebase-tools"
    exit 1
fi

# Verificar que el usuario esté autenticado
echo "🔐 Verificando autenticación..."
firebase login:ci --no-localhost 2>&1 | grep -q "Success"
if [ $? -ne 0 ]; then
    echo "⚠️  No estás autenticado. Ejecutando login..."
    firebase login
fi

# Seleccionar proyecto
echo ""
echo "📋 Seleccionando proyecto bolsa-de-trabjo..."
firebase use bolsa-de-trabjo

# Exportar usuarios
echo ""
echo "📤 Exportando usuarios..."
firebase auth:export users-bolsatrabajo.json

# Verificar si la exportación fue exitosa
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ ¡Exportación exitosa!"
    echo ""
    echo "📁 Archivo creado: users-bolsatrabajo.json"
    
    # Contar usuarios exportados
    if command -v jq &> /dev/null; then
        USER_COUNT=$(jq '.users | length' users-bolsatrabajo.json)
        echo "👥 Total de usuarios exportados: $USER_COUNT"
        echo ""
        
        # Mostrar estadísticas
        echo "📊 Estadísticas:"
        EMAIL_COUNT=$(jq '[.users[] | select(.email != null)] | length' users-bolsatrabajo.json)
        echo "   - Con email: $EMAIL_COUNT"
        
        VERIFIED_COUNT=$(jq '[.users[] | select(.emailVerified == true)] | length' users-bolsatrabajo.json)
        echo "   - Email verificado: $VERIFIED_COUNT"
        
        GOOGLE_COUNT=$(jq '[.users[] | select(.providerUserInfo[]?.providerId == "google.com")] | length' users-bolsatrabajo.json)
        echo "   - Con Google OAuth: $GOOGLE_COUNT"
    fi
    
    echo ""
    echo "📧 Próximos pasos:"
    echo "1. Revisar el archivo users-bolsatrabajo.json"
    echo "2. Enviar este archivo al equipo de ControlFile"
    echo "3. Solicitar importación al Auth Central"
    echo "4. Solicitar asignación de claims para app 'controltrabajo'"
    echo ""
    
else
    echo ""
    echo "❌ Error durante la exportación"
    echo "   Verifica que tienes permisos de administrador en el proyecto"
    exit 1
fi

