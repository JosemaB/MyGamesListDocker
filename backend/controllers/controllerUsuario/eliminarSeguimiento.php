<?php
include_once '../../config/cors.php';
include_once '../../config/ConexionBdd.php';
include_once '../../helpers/funciones.php';

try {
    // Obtener los datos enviados en formato JSON
    $datos = json_decode(file_get_contents('php://input'), true);

    if ($datos) {
        $idUsuario = $datos['idUsuario'];  // El usuario que está dejando de seguir
        $idSeguido = $datos['idSeguido'];  // La persona que va a ser dejada de seguir

        // Creamos la conexión
        $baseDeDatos = new ConexionBdd();
        $conexion = $baseDeDatos->getConnection();

        // Consulta SQL para eliminar la relación de seguimiento
        $sql = "DELETE FROM relaciones WHERE id_usuario = ? AND id_seguidor = ?";

        // Preparar la consulta
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("ii", $idUsuario, $idSeguido);  // "ii" significa que ambos parámetros son enteros

        // Ejecutar la consulta
        if ($stmt->execute()) {
            // Si la eliminación es exitosa
            if ($stmt->affected_rows > 0) {
                $exito = "Has dejado de seguir a este usuario. Reinicia la página para ver los cambios";
            } else {
                $error = "No estabas siguiendo a este usuario";
            }
        } else {
            $error = "Error al dejar de seguir al usuario";
        }

        // Cerrar la declaración y la conexión
        $stmt->close();
        $conexion->close();
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

