<?php
include_once '../../config/cors.php';  // Incluye CORS para poder hacer la conexión con tu frontend
include_once '../../config/ConexionBdd.php';  // Para la conexion de la base de datos MyGamesList
include_once '../../helpers/funciones.php';

try {
    $datos = json_decode(file_get_contents('php://input'), true);
    if ($datos) {
        $id = $datos["idUsuario"];
        $nombreUsuario = validarCadena($datos["nombreUsuario"]);

        // Creamos la conexión a la base de datos
        $baseDeDatos = new ConexionBdd();
        $conexion = $baseDeDatos->getConnection();

        // Consulta para obtener el nombre de usuario actual
        $consultaNombreQuery = "SELECT nombre_usuario FROM usuarios WHERE id_usuario = ?";
        $consultaNombreStmt = $conexion->prepare($consultaNombreQuery);
        $consultaNombreStmt->bind_param("s", $id);
        $consultaNombreStmt->execute();
        $consultaNombreStmt->bind_result($nombreActual);
        $consultaNombreStmt->fetch();
        $consultaNombreStmt->close();

        // Consulta para verificar si el nuevo nombre de usuario ya existe
        $verificarNombreQuery = "SELECT COUNT(*) FROM usuarios WHERE nombre_usuario = ?";
        $verificarNombreStmt = $conexion->prepare($verificarNombreQuery);
        $verificarNombreStmt->bind_param("s", $nombreUsuario);
        $verificarNombreStmt->execute();
        $verificarNombreStmt->bind_result($nombreExiste);
        $verificarNombreStmt->fetch();
        $verificarNombreStmt->close();

        if (!$nombreUsuario) {
            $error = "El nuevo nombre de usuario no puede estar vacío";
        } else if ($nombreActual === $nombreUsuario) {
            $error = "El nuevo nombre de usuario no puede ser igual al nombre actual";
        } else if ($nombreExiste > 0) {
            $error = "El nombre de usuario ya está en uso";
        } else if (strlen($nombreUsuario) > 15) {
            $error = "El nombre de usuario no puede tener más de 15 caracteres";
        } else {
            // Consulta para actualizar el nombre de usuario
            $usuariosQuery = "UPDATE usuarios SET nombre_usuario = ? WHERE id_usuario = ?";
            $usuariosStmt = $conexion->prepare($usuariosQuery);
            $usuariosStmt->bind_param("ss", $nombreUsuario, $id);

            if ($usuariosStmt->execute()) {
                // Devolvemos el resultado
                $exito = "El nombre de usuario se ha actualizado correctamente";
            } else {
                $error = "Error al actualizar el nombre de usuario";
            }

            $usuariosStmt->close();
        }

        // Cerrar la conexión
        $conexion->close();
    } else {
        $error = "Datos no encontrados";
    }
} catch (Exception $e) {
    // Capturar cualquier error y devolverlo
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