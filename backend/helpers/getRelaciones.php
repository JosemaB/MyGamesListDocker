<?php
include_once '../config/cors.php';
include_once '../config/ConexionBdd.php';
include_once './funciones.php';

try {
    // Obtener los datos enviados en formato JSON
    $datos = json_decode(file_get_contents('php://input'), true);

    if ($datos) {
        $idUsuario = (int) validarCadena($datos["idUsuario"]);

        // Creamos la conexión
        $baseDeDatos = new ConexionBdd();
        $conexion = $baseDeDatos->getConnection();

        // Array para almacenar resultados
        $seguidos = array();
        $seguidores = array();

        // Consulta para obtener los usuarios que sigue el usuario actual
        $sqlSeguidos = "SELECT u.id_usuario, u.nombre_usuario, u.avatar 
                        FROM relaciones r
                        INNER JOIN usuarios u ON r.id_seguidor = u.id_usuario
                        WHERE r.id_usuario = ?";

        $stmt = $conexion->prepare($sqlSeguidos);
        $stmt->bind_param("i", $idUsuario);
        $stmt->execute();
        $resultado = $stmt->get_result();

        while ($row = $resultado->fetch_assoc()) {
            $seguidos[] = $row; // Agregar cada usuario seguido al array
        }
        $stmt->close();

        // Consulta para obtener los seguidores del usuario actual
        $sqlSeguidores = "SELECT u.id_usuario, u.nombre_usuario, u.avatar 
                          FROM relaciones r
                          INNER JOIN usuarios u ON r.id_usuario = u.id_usuario
                          WHERE r.id_seguidor = ?";

        $stmt = $conexion->prepare($sqlSeguidores);
        $stmt->bind_param("i", $idUsuario);
        $stmt->execute();
        $resultado = $stmt->get_result();

        while ($row = $resultado->fetch_assoc()) {
            $seguidores[] = $row; // Agregar cada seguidor al array
        }
        $stmt->close();

        // Cerrar conexión
        $conexion->close();

        $exito = "Datos de seguidores y seguidos obtenidos";
    } else {
        $error = "Datos no encontrados";
    }

} catch (Exception $e) {
    $error = $e->getMessage();
}

// Si hay error, devolvemos JSON y detenemos la ejecución
if (isset($error)) {
    echo json_encode(["success" => false, "error" => $error]);
} else if (isset($exito)) {
    // Si todo está bien, devolvemos los datos
    echo json_encode(["success" => true, "seguidos" => $seguidos, "seguidores" => $seguidores]);
}
exit();
