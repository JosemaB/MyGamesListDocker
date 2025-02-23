<?php
include_once '../../config/cors.php';  // Incluye CORS para poder hacer la conexión con tu frontend
include_once '../../config/ConexionBdd.php';  // Para la conexion de la base de datos MyGamesList
include_once '../../helpers/funciones.php';

try {
    $datos = json_decode(file_get_contents('php://input'), true);
    if ($datos) {
        $id = $datos["idUsuario"];

        // Creamos la conexión a la base de datos
        $baseDeDatos = new ConexionBdd();
        $conexion = $baseDeDatos->getConnection();

        // Consulta para verificar si el usuario existe
        $consultaUsuarioQuery = "SELECT COUNT(*) FROM usuarios WHERE id_usuario = ?";
        $consultaUsuarioStmt = $conexion->prepare($consultaUsuarioQuery);
        $consultaUsuarioStmt->bind_param("s", $id);
        $consultaUsuarioStmt->execute();
        $consultaUsuarioStmt->bind_result($usuarioExiste);
        $consultaUsuarioStmt->fetch();
        $consultaUsuarioStmt->close();

        if ($usuarioExiste == 0) {
            $error = "El usuario no existe";
        } else {
            // Consulta para eliminar el usuario
            $usuariosQuery = "DELETE FROM usuarios WHERE id_usuario = ?";
            $usuariosStmt = $conexion->prepare($usuariosQuery);
            $usuariosStmt->bind_param("s", $id);

            if ($usuariosStmt->execute()) {
                // Devolvemos el resultado
                $exito = "El usuario ha sido eliminado con éxito. Recarga la página para actualizar los cambios";
            } else {
                $error = "Error al eliminar el usuario";
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