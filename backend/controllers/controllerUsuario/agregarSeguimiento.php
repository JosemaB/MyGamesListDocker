<?php
include_once '../../config/cors.php';
include_once '../../config/ConexionBdd.php';
include_once '../../helpers/funciones.php';

try {
    // Obtener los datos enviados en formato JSON
    $datos = json_decode(file_get_contents('php://input'), true);

    if ($datos) {
        $idUsuario = $datos['idUsuario'];  // El usuario que está haciendo el seguimiento
        $idSeguido = $datos['idSeguido'];  // La persona que va a ser seguida

        // Creamos la conexión
        $baseDeDatos = new ConexionBdd();
        $conexion = $baseDeDatos->getConnection();

        // Primero, comprobar si ya existe la relación de seguimiento
        $sql = "SELECT 1 FROM relaciones WHERE id_usuario = ? AND id_seguidor = ? LIMIT 1";

        // Preparar la consulta
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("ii", $idUsuario, $idSeguido);  // "ii" significa que ambos parámetros son enteros

        // Ejecutar la consulta
        $stmt->execute();
        $resultado = $stmt->get_result();

        // Si no existe la relación, entonces insertamos un nuevo registro
        if ($resultado->num_rows == 0) {
            // Consulta para insertar el nuevo seguimiento
            $insertSql = "INSERT INTO relaciones (id_usuario, id_seguidor, fecha_seguimiento) VALUES (?, ?, NOW())";

            // Preparar la consulta de inserción
            $insertStmt = $conexion->prepare($insertSql);
            $insertStmt->bind_param("ii", $idUsuario, $idSeguido);

            // Ejecutar la consulta de inserción
            if ($insertStmt->execute()) {
                $exito = "Seguimiento realizado con éxito. Reinicia la página para ver los cambios";
            } else {
                $error = "Error al seguir al usuario";
            }

            // Cerrar la declaración de inserción
            $insertStmt->close();
        } else {
            $error = "Ya sigues a este usuario";
        }

        // Cerrar la conexión
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
