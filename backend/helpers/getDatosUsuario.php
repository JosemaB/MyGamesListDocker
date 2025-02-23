<?php
include_once '../config/cors.php';  // Incluye CORS para poder hacer la conexión con tu frontend
include_once '../config/ConexionBdd.php';  //Para la conexion de la base de datos MyGamesList
include_once './funciones.php';
try {
    // Obtener los datos enviados en formato JSON
    $datos = json_decode(file_get_contents('php://input'), true);
    if ($datos) {
        
        $idUsuario = $datos['idUsuario'];

        //Creamos la conexion ya con los campos validados
        $baseDeDatos = new ConexionBdd();
        $conexion = $baseDeDatos->getConnection();

        // Consulta SQL para obtener los datos de la tabla usuarios según id_lista
        $sql = "SELECT * FROM usuarios WHERE id_usuario = ?";

        // Preparar la consulta
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("i", $idUsuario); // "i" significa que el parámetro es un entero

        // Ejecutar la consulta
        $stmt->execute();

        // Obtener el resultado
        $resultado = $stmt->get_result();

        // Crear un array para almacenar los datos

        $contenidoUsuario = $resultado->fetch_assoc();
        $exito = "Contenido usuario guardado";

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
    echo json_encode(["success" => true, "contenidoUsuario" => $contenidoUsuario]);
}
exit();