@echo off
echo.
echo  =============================================
echo   CerberusMaker Link Page
echo  =============================================
echo.
echo  Instalando dependencias...
call npm install
echo.
echo  Iniciando servidor...
echo  Pagina NFC:   http://localhost:3000
echo  Admin panel:  http://localhost:3000/admin
echo  Contrasena:   cerberus2024
echo.
node server.js
pause
