<?php
include_once '../config/cors.php';  // Incluye CORS para poder hacer la conexión con tu frontend
include_once '../config/ConexionBdd.php';  //Para la conexion de la base de datos MyGamesList
include_once './funciones.php';
try {
    // Obtener los datos enviados en formato JSON
    $datos = json_decode(file_get_contents('php://input'), true);
    if ($datos) {
        $idUsuario = (int) validarCadena($datos["idUsuario"]);

        //Creamos la conexion ya con los campos validados
        $baseDeDatos = new ConexionBdd();
        $conexion = $baseDeDatos->getConnection();

        // Consulta SQL para obtener los datos de la tabla lista_videojuegos según id_lista
        $sql = "SELECT r.*, u.nombre_usuario, u.avatar FROM resenas r, usuarios u WHERE r.id_usuario = ? and r.id_usuario = u.id_usuario";

        // Preparar la consulta
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("i", $idUsuario); // "i" significa que el parámetro es un entero

        // Ejecutar la consulta
        $stmt->execute();

        // Obtener el resultado
        $resultado = $stmt->get_result();

        // Crear un array para almacenar los datos
        $listaJuegos = array();

        // Verificar si hay algún registro
        if ($resultado->num_rows > 0) {
            while ($row = $resultado->fetch_assoc()) {
                $listaJuegos[] = $row; // Agregar cada lista al arreglo
            }
            $exito = "Resenas guardadas";
        } else {
            $exito = 0;
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
    echo json_encode(["success" => true, "resenas" => $listaJuegos]);
}
exit();