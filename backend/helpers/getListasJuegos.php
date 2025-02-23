<?php
include_once '../config/cors.php';  // Incluye CORS para poder hacer la conexión con tu frontend
include_once '../config/ConexionBdd.php';  //Para la conexion de la base de datos MyGamesList
include_once './funciones.php';
try {
    // Obtener los datos enviados en formato JSON
    $datos = json_decode(file_get_contents('php://input'), true);
    if ($datos) {
        $id = $datos['id'];

        //Creamos la conexion ya con los campos validados
        $baseDeDatos = new ConexionBdd();
        $conexion = $baseDeDatos->getConnection();

        // Consulta 1: Obtener el total de listas
        $totalListasQuery = "SELECT COUNT(*) AS total_listas FROM listas WHERE id_usuario = ?";
        $totalListasStmt = $conexion->prepare($totalListasQuery);
        $totalListasStmt->bind_param("i", $id);
        $totalListasStmt->execute();
        $totalListasStmt->bind_result($total_listas);
        $totalListasStmt->fetch();
        $totalListasStmt->close();

        if ($total_listas > 0) {
            // Consulta 2: Obtener las listas con sus detalles
            $listasQuery = "SELECT id_lista, nombre_lista, fecha_creacion FROM listas WHERE id_usuario = ?";
            $listasStmt = $conexion->prepare($listasQuery);
            $listasStmt->bind_param("i", $id);
            $listasStmt->execute();
            $listasResult = $listasStmt->get_result();

            // Arreglo para almacenar las listas
            $listas = [];

            while ($row = $listasResult->fetch_assoc()) {
                $listas[] = $row; // Agregar cada lista al arreglo
            }

            // Cerrar el statement
            $listasStmt->close();
        }


        // Crear un arreglo para el resultado
        $result = array(
            "total_listas" => $total_listas,
            "total_contenido" => $listas ?? null
        );

        //Devolvemos el resultado
        echo json_encode(["success" => true, "listas" => $result]);
        // Cerrar la conexión
        $conexion->close();
    } else {
        $error = "Datos no encontrados";
    }

} catch (Exception $e) {
    $error = $e->getMessage();
}
if (isset($error)) {
    echo json_encode(["success" => false, "error" => $error]);
}
exit();