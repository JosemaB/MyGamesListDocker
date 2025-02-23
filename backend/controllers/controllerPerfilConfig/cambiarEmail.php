<?php
include_once '../../config/cors.php';
include_once '../../helpers/funciones.php';
include_once '../../config/ConexionBdd.php';  //Para la conexion de la base de datos MyGamesList
session_start();
try {
    // Obtener los datos enviados en formato JSON
    $datos = json_decode(file_get_contents('php://input'), true);
    if ($datos) {
        $id = validarCadena($datos["id"]);
        $emailActual = validarCadena($datos['email']);
        $emailNuevo = validarCadena($datos['newEmail']);

        if (!$emailActual) {
            $error = ["email" => "Por favor, ingresa un email válido"];

        } else if (!$emailNuevo) {
            $error = ["newEmail" => "Por favor, ingresa un nuevo email válido"];

        } else {
            //Creamos la conexion ya con los campos validados
            $baseDeDatos = new ConexionBdd();
            $conexion = $baseDeDatos->getConnection();

            //Aqui se comprobamos si algun usario tiene el mismo email
            $consultaUsuario = $conexion->prepare("select *  from usuarios where email = ?");
            $consultaUsuario->bind_param("s", $emailNuevo);
            $consultaUsuario->execute();
            $usuarioExiste = $consultaUsuario->get_result();

            if ($usuarioExiste->num_rows > 0) {
                $error = ["newEmail" => "El nuevo correo electrónico ya está en uso. Por favor, introduce uno diferente"];
            } else {
                //Convalidamos la contrasena del usuario actual
                $consultaUsuarioBdd = $conexion->prepare("select contrasena, email from usuarios where id_usuario = ?");
                $consultaUsuarioBdd->bind_param("s", $id);
                $consultaUsuarioBdd->execute();
                $usuarioExiste = $consultaUsuarioBdd->get_result();
                $usario = $usuarioExiste->fetch_assoc();

                if ($usario["email"] !== $emailActual) {
                    $error = ["email" => "El correo electrónico actual es incorrecto"];
                } else if ($usario["email"] === $emailNuevo) {
                    $error = ["newEmail" => "El nuevo correo electrónico no puede ser el mismo que el actual. Por favor, introduce uno diferente"];
                } else if (!password_verify($datos['constrasena'], $usario["contrasena"])) {
                    $error = ["contrasenaEmail" => "La contraseña es incorrecta. Por favor, inténtalo de nuevo"];
                }

                if (!isset($error)) {
                    $consultaActualizarEmail = $conexion->prepare("UPDATE usuarios SET email = ? WHERE id_usuario = ?");
                    $consultaActualizarEmail->bind_param("ss", $emailNuevo, $id);
                    $consultaActualizarEmail->execute();
                    $exito = "El correo electrónico se ha actualizado correctamente";
                    $_SESSION['usuario']['email'] = $emailNuevo;
                }
            }
        }
    } else {
        $error = "Datos no encontrados";
    }
} catch (Exception $e) {
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