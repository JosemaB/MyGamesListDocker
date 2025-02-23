<?php
// Si es una solicitud OPTIONS (preflight), responde con los encabezados CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: http://localhost:5500"); // Permite el acceso desde el frontend
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS"); // Métodos permitidos
    header("Access-Control-Allow-Headers: Content-Type, Authorization, XDEBUG_SESSION"); // Cabeceras permitidas
    header("Access-Control-Allow-Credentials: true"); // Permitir el envío de cookies y credenciales
    exit(); // Terminar la ejecución
}

// Encabezados CORS en todas las respuestas
header("Access-Control-Allow-Origin: http://localhost:5500");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, XDEBUG_SESSION");
header("Access-Control-Allow-Credentials: true"); // IMPORTANTE para `credentials: "include"`




