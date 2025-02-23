<?php
include_once '../config/ConexionBdd.php';  // Para la conexión de la base de datos MyGamesList
include_once '../config/cors.php';  // Incluye CORS para poder hacer la conexión con mi frontend
include_once '../helpers/funciones.php';


$datos = json_decode(file_get_contents('php://input'), true);

try {
    if ($datos) {
        $password = validarCadena($datos['newPassword']);
        $confirmPassword = validarCadena($datos['confirmPassword']);
        $token = validarCadena($datos['token']);

        if (!validarContrasena($password)) {
            $error = ["password" => "La contraseña debe tener al menos 6 caracteres e incluir lo siguiente: una letra mayúscula, una minúscula, un número y un carácter especial (!@#$%^&*?.)"];
        } else if ($confirmPassword != $password) {
            $error = ["confirmPassword" => "Las contraseñas no coinciden, por favor verifica y vuelve a intentarlo"];
        } else if (strlen($password) > 255) {
            $error = "La contraseña no puede tener más de 255 caracteres.";
        }

        if (!isset($error)) {
            //Creamos la conexion ya con los campos validados
            $baseDeDatos = new ConexionBdd();
            $conexion = $baseDeDatos->getConnection();

            // Verificar si el token es válido
            $consultaToken = $conexion->prepare("SELECT email FROM password_resets WHERE token = ? AND expires_at > NOW()");
            $consultaToken->bind_param("s", $token);
            $consultaToken->execute();
            $resultadoToken = $consultaToken->get_result();

            if ($resultadoToken->num_rows > 0) {
                // Token válido, obtener el email asociado al token
                $fila = $resultadoToken->fetch_assoc();
                $email = $fila['email'];

                // Actualizar la contraseña del usuario
                // Preparar la consulta para obtener la contraseña actual del usuario
                $consultaContrasenaUsuario = $conexion->prepare("SELECT contrasena FROM usuarios WHERE email = ?");
                $consultaContrasenaUsuario->bind_param("s", $email);
                $consultaContrasenaUsuario->execute();

                // Obtener el resultado de la consulta
                $resultadoContrasenaUsuario = $consultaContrasenaUsuario->get_result();

                // Recuperar la contraseña encriptada de la base de datos
                $filaContrasenaUsuario = $resultadoContrasenaUsuario->fetch_assoc();

                if (password_verify($password, $filaContrasenaUsuario["contrasena"])) {
                    $error = "La nueva contraseña no puede ser la misma que la anterior";

                } else {
                    // Encriptar la nueva contraseña
                    $newPasswordHash = password_hash($password, PASSWORD_BCRYPT);
                    // Actualizar la contraseña del usuario
                    $updatePassword = $conexion->prepare("UPDATE usuarios SET contrasena = ? WHERE email = ?");
                    $updatePassword->bind_param("ss", $newPasswordHash, $email);
                    $updatePassword->execute();

                    // Eliminar el token para que no pueda usarse de nuevo
                    $deleteToken = $conexion->prepare("DELETE FROM password_resets WHERE token = ?");
                    $deleteToken->bind_param("s", $token);
                    $deleteToken->execute();

                    //Mensaje de exito de contraseña confirmada cambiada
                    $exito = "Tu contraseña ha sido actualizada con éxito. Serás redirigido a la página de inicio de sesión";
                }


            } else {
                $error = "El enlace para restablecer tu contraseña ha caducado. Por favor, solicita uno nuevo para continuar";
            }
        }
    } else {
        $error = "Datos no encontrados";
    }
} catch (Exception $e) {
    $error = $e->getMessage();
}
// Si hay error, devolver como JSON
if (isset($error)) {
    echo json_encode(["success" => false, "error" => $error]);
} else if (isset($exito)) {
    // Si todo está bien, devolvemos éxito
    echo json_encode(["success" => true, "exito" => $exito]);
}
