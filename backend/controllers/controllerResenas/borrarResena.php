<?php
include_once '../../config/cors.php';  // Incluye CORS para poder hacer la conexión con tu frontend
include_once '../../config/ConexionBdd.php';  // Para la conexión de la base de datos MyGamesList
include_once '../../helpers/funciones.php';

try {
    // Obtener los datos enviados en formato JSON
    $datos = json_decode(file_get_contents('php://input'), true);
    if ($datos) {
        $idUsuario =  validarCadena($datos['idUsuario']);
        $idResena = (int) validarCadena($datos['idResena']);

        if (!$idUsuario || !$idResena) {
            $error = ["No se pudo eliminar la reseña. Por favor, intenta nuevamente"];
        }

        // Creamos la conexión ya con los campos validados
        $baseDeDatos = new ConexionBdd();
        $conexion = $baseDeDatos->getConnection();

        // Verificar si la reseña existe
        $checkResenaExistQuery = "SELECT id_resena FROM resenas WHERE id_resena = ?";
        $checkResenaExistStmt = $conexion->prepare($checkResenaExistQuery);
        $checkResenaExistStmt->bind_param("i", $idResena);
        $checkResenaExistStmt->execute();
        $checkResenaExistResult = $checkResenaExistStmt->get_result();

        if ($checkResenaExistResult->num_rows === 0) {
            $error = ["La reseña no existe"];
        } else {
            // Verificar si la reseña pertenece al usuario
            $checkResenaQuery = "SELECT id_resena FROM resenas WHERE id_resena = ? AND id_usuario = ?";
            $checkResenaStmt = $conexion->prepare($checkResenaQuery);
            $checkResenaStmt->bind_param("is", $idResena, $idUsuario);
            $checkResenaStmt->execute();
            $checkResenaResult = $checkResenaStmt->get_result();

            if ($checkResenaResult->num_rows > 0 || $idUsuario === "Administrador") {
                // Si la reseña existe y pertenece al usuario, procedemos a eliminarla
                $deleteResenaQuery = "DELETE FROM resenas WHERE id_resena = ?";
                $deleteResenaStmt = $conexion->prepare($deleteResenaQuery);
                $deleteResenaStmt->bind_param("i", $idResena);
                $deleteResenaStmt->execute();

                if ($deleteResenaStmt->affected_rows > 0) {
                    $exito = ["La reseña ha sido eliminada con éxito"];
                } else {
                    $error = ["Hubo un problema al eliminar la reseña. Por favor, inténtalo de nuevo"];
                }
                $deleteResenaStmt->close();
            } else {
                $error = ["La reseña no pertenece a este usuario"];
            }

            // Cerrar el statement de verificación de propiedad
            $checkResenaStmt->close();
        }

        // Cerrar el statement de verificación de existencia
        $checkResenaExistStmt->close();
        // Cerrar la conexión
        $conexion->close();
    } else {
        $error = ["No se pudo eliminar la reseña. Por favor, intenta nuevamente"];
    }
} catch (Exception $e) {
    $error = ["No se pudo eliminar la reseña. Por favor, intenta nuevamente"];
}

// Si hay error, los devolvemos como JSON y detenemos la ejecución
if (isset($error)) {
    echo json_encode(["success" => false, "error" => $error]);
} else if (isset($exito)) {
    // Si todo está bien, continuamos con el registro
    echo json_encode(["success" => true, "exito" => $exito]);
}
exit();