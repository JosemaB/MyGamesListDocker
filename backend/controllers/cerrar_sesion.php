<?php
include_once '../config/cors.php'; 
session_start(); // Asegurar que la sesión está iniciada

// Verificar si hay una sesión activa antes de destruirla
if (isset($_SESSION['usuario'])) {
    session_destroy(); // Eliminar sesión en el servidor

    // Borrar la cookie (debe coincidir con los parámetros usados en setcookie)
    setcookie("sesion_token", "", time() - 3600, "/", "localhost", false, true); 

    echo json_encode(["success" => true, "mensaje" => "Sesion cerrada"]);
} else {
    echo json_encode(["success" => false, "mensaje" => "No hay sesion activa"]);
}
exit();
