<?php
include_once '../config/cors.php';  // Incluye CORS para poder hacer la conexion con mi frontend

// Mueve session_id() antes de session_start()
if (isset($_COOKIE['sesion_token'])) {
    // Establecer el session_id desde la cookie para la sesión actual
    session_id($_COOKIE['sesion_token']);
}

session_start(); // Ahora inicia la sesión

// Verificar si existe la cookie "sesion_token"
if (isset($_COOKIE['sesion_token'])) {
    // Ahora PHP puede usar el session_id para acceder a la sesión
    if (isset($_SESSION['usuario'])) {
        // La sesión está activa, el usuario está logueado
        $exito = ["usuario" => $_SESSION['usuario']];
    } else {
        // La cookie existe pero no hay sesión activa (el session_id no es válido)
        $error = "Sesión no valida";
    }
} else {
    // La cookie no existe, el usuario no está logueado
    $error = "No hay sesion activa";
}

// Si hay error, los devolvemos como JSON y detenemos la ejecución
if (isset($error)) {
    echo json_encode(["success" => false, "error" => $error]);
} else if (isset($exito)) {
    // Si todo está bien, continuamos con el registro
    echo json_encode(["success" => true, "exito" => $exito]);
}
exit();
