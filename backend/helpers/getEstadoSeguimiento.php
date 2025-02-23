<?php
include_once '../config/cors.php';
include_once '../config/ConexionBdd.php';
include_once './funciones.php';

try {
    // Obtener los datos enviados en formato JSON
    $datos = json_decode(file_get_contents('php://input'), true);

    if ($datos) {
        $idUsuario = $datos['idUsuario'];  // El usuario que hace la consulta
        $idSeguido = $datos['idSeguido'];  // La persona que se quiere verificar si sigue

        // Creamos la conexión
        $baseDeDatos = new ConexionBdd();
        $conexion = $baseDeDatos->getConnection();

        // Consulta SQL para verificar si el usuario sigue a otra persona
        $sql = "SELECT 1 FROM relaciones WHERE id_usuario = ? AND id_seguidor = ? LIMIT 1";

        // Preparar la consulta
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("ii", $idUsuario, $idSeguido); // "ii" significa que ambos parámetros son enteros

        // Ejecutar la consulta
        $stmt->execute();
        $resultado = $stmt->get_result();

        // Verificar si se encontró un registro
        $sigue = $resultado->num_rows > 0; // Devuelve true si encontró una relación de seguimiento

        // Cerrar la conexión
        $stmt->close();
        $conexion->close();

        echo json_encode(["success" => true, "sigue" => $sigue]);
    } else {
        echo json_encode(["success" => false, "error" => "Datos no encontrados"]);
    }

} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
exit();
