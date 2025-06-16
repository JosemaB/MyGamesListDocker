<?php

// Incluir archivos necesarios
include_once '../config/ConexionBdd.php';  // Conexión a la base de datos
include_once '../config/cors.php';         // CORS para permitir conexión con frontend
include_once '../helpers/funciones.php';   // Funciones auxiliares
include_once './iniciar_sesion.php';       // Manejo de sesión

try {
    // Obtener datos JSON enviados desde el frontend
    $datos = json_decode(file_get_contents('php://input'), true);

    if ($datos && isset($datos['email'], $datos['password'])) {
        $email = validarCadena($datos['email']);
        $password = $datos['password'];

        // Conectarse a la base de datos
        $baseDeDatos = new ConexionBdd();
        $conexion = $baseDeDatos->getConnection();

        // Verificar si el usuario existe
        $consultaUsuario = $conexion->prepare("SELECT contrasena, metodo_registro FROM usuarios WHERE email = ?");
        $consultaUsuario->bind_param("s", $email);
        $consultaUsuario->execute();
        $resultado = $consultaUsuario->get_result();
        $usuario = $resultado->fetch_assoc();

        if ($usuario) {
            if ($usuario["metodo_registro"] === 'google') {
                $error = 'El correo que estás ingresando está vinculado con Google. Por favor, inicia sesión con tu cuenta de Google.';
            } elseif (password_verify($password, $usuario["contrasena"])) {
                // Iniciar sesión correctamente
                iniciarSesion($email);
                $exito = "Inicio de sesión exitoso";
            } else {
                $error = 'Correo electrónico o contraseña incorrectos.';
            }
        } else {
            $error = "El correo electrónico ingresado no está asociado a ninguna cuenta. Regístrate para acceder.";
        }

        // Cerrar conexión
        $baseDeDatos->closeConnection();
    } else {
        $error = "Datos incompletos o mal enviados.";
    }
} catch (Exception $ex) {
    $error = $ex->getMessage();
}

// Devolver respuesta JSON
if (isset($error)) {
    echo json_encode(["success" => false, "error" => $error]);
} else if (isset($exito)) {
    echo json_encode(["success" => true, "exito" => $exito]);
}

exit();
