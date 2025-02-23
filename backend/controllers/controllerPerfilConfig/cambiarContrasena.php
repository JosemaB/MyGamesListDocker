<?php
include_once '../../config/cors.php';
include_once '../../helpers/funciones.php';
include_once '../../config/ConexionBdd.php';  //Para la conexion de la base de datos MyGamesList
try {
    // Obtener los datos enviados en formato JSON
    $datos = json_decode(file_get_contents('php://input'), true);
    if ($datos) {
        $id = validarCadena($datos["id"]);
        $passwordActual = validarCadena($datos['passwordActual']);
        $newPassword = validarCadena($datos['newPassword']);
        $confirmNewPassword = validarCadena($datos['confirmNewPassword']);

        if (!$passwordActual) {
            $error = ["passwordActual" => "Por favor, ingresa una contraseña actual válida"];

        } else if (!$newPassword) {
            $error = ["newPassword" => "Por favor, ingresa una nueva contraseña válida"];

        } else if (!$confirmNewPassword) {
            $error = ["confirmNewPassword" => "La confirmación de la nueva contraseña es obligatoria. Asegúrate de ingresarla correctamente"];

        } else if ($newPassword !== $confirmNewPassword) {
            $error = ["passwordActual" => "La nueva contraseña y la confirmación no coinciden. Asegúrate de ingresar la misma contraseña en ambos campos"];

        } else if (strlen($newPassword) > 255) {

            $error = ["newPassword" => "La contraseña no puede tener más de 255 caracteres"];

        } else {
            //Creamos la conexion ya con los campos validados
            $baseDeDatos = new ConexionBdd();
            $conexion = $baseDeDatos->getConnection();

            //Confirmarmo que pa
            $consultaUsuario = $conexion->prepare("select contrasena from usuarios where id_usuario = ?");
            $consultaUsuario->bind_param("s", $id);
            $consultaUsuario->execute();
            $usuarioContenido = $consultaUsuario->get_result();
            $usuario = $usuarioContenido->fetch_assoc();

            if (!password_verify($passwordActual,$usuario["contrasena"])) {
                $error = ["passwordActual" => "La contraseña actual que ingresaste no coincide con tu contraseña registrada"];
            } else if (password_verify($newPassword, $usuario["contrasena"])) {
                $error = ["newPassword" => "La nueva contraseña no puede ser igual a la contraseña actual. Por favor, elige una diferente"];
            }
            if (!isset($error) && !validarContrasena($newPassword)) {
                $error = ["newPassword" => "La contraseña debe tener al menos 6 caracteres e incluir lo siguiente: una letra mayúscula, una minúscula, un número y un carácter especial (!@#$%^&*?.)"];

            }
            if (!isset($error)) {
                $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);
                $consultaActualizarEmail = $conexion->prepare("UPDATE usuarios SET contrasena = ? WHERE id_usuario = ?");
                $consultaActualizarEmail->bind_param("ss", $hashedPassword, $id);
                $consultaActualizarEmail->execute();
                $exito = "La contraseña se ha actualizado correctamente";
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