<?php
include_once '../config/ConexionBdd.php';
session_start();

function iniciarSesion($email)
{
    try {
        //Creamos la conexion 
        $baseDeDatos = new ConexionBdd();
        $conexion = $baseDeDatos->getConnection();

        $consultaUsuario = $conexion->prepare("select r.nombre_rol, u.id_usuario, u.nombre_usuario, u.avatar, u.fecha_registro, u.id_rol, u.metodo_registro from usuarios u, roles r where r.id_rol = u.id_rol and email = ?");
        $consultaUsuario->bind_param("s", $email);
        $consultaUsuario->execute();
        $usuarioExiste = $consultaUsuario->get_result();
        $usuarioResultado = $usuarioExiste->fetch_assoc();

        // Guardar datos en la sesión
        $_SESSION['usuario'] = [
            'id' => $usuarioResultado['id_usuario'],
            'nombre' => $usuarioResultado['nombre_usuario'],
            'email' => $email,
            'fecha_registro' => $usuarioResultado['fecha_registro'],
            'metodo_registro' => $usuarioResultado['metodo_registro'],
            'rol' => $usuarioResultado['nombre_rol'],
            'avatar' => $usuarioResultado['avatar']
        ];

        // Guardar session_id en una cookie para mantener la sesión, la cookie dura 30 dias
        setcookie("sesion_token", session_id(), time() + (86400 * 30), "/", "localhost", false, false); 

        $exito = "sesion y cookie generada";
    } catch (Exception $e) {
        $baseDeDatos->closeConnection();
        $error = $e->getMessage();
    }
    // Si hay error, los devolvemos como JSON y detenemos la ejecución
    if (isset($error)) {
        echo json_encode(["success" => false, "error" => $error]);
    } else if (isset($exito)) {
        // Si todo está bien, continuamos con el registro
        echo json_encode(["success" => true, "exito" => $exito]);
    }
    exit();
}

