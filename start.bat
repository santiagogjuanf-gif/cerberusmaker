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
echo  Pagina principal: http://localhost:11094
echo  Admin panel:      http://localhost:11094/admin
echo  Contrasena:       cerberus2024
echo.
node server.js
pause
