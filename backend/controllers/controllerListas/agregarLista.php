<?php
include_once '../../config/ConexionBdd.php';  //Para la conexion de la base de datos MyGamesList
include_once '../../config/cors.php';  // Incluye CORS para poder hacer la conexion con mi frontend
include_once '../../helpers/funciones.php';

try {
    // Obtener los datos enviados en formato JSON
    $datos = json_decode(file_get_contents('php://input'), true);
    if ($datos) {
        $nombreLista = validarCadena($datos['nombreLista']);
        $idUsuario = validarCadena($datos['idUsuario']);
        $numTotalListas = validarCadena($datos['totalListas']);

        if (!$nombreLista) {
            $error = ["nombreList" => "El nombre no de la lista no debe estar vacío"];
        }else if (strlen($nombreLista) > 50) {
            $error = ["nombreList" => "El nombre no debe tener más de 50 caracteres"];
        } else if (!$idUsuario) {
            $error = ["error al obtener el usuario"];
        } else if ($numTotalListas >= 10) {
            $error = ["Has alcanzado el límite de 10 listas. Elimina una para crear una nueva"];

        } else {
            //Creamos la conexion ya con los campos validados
            $baseDeDatos = new ConexionBdd();
            $conexion = $baseDeDatos->getConnection();

            // Preparar la consulta para insertar la nueva lista
            $insertLista = $conexion->prepare("INSERT INTO listas (id_usuario, nombre_lista) VALUES (?, ?)");

            // Enlazar parámetros y ejecutar la consulta
            $insertLista->bind_param("is", $idUsuario, $nombreLista);
            $insertLista->execute();

            // Verificar si la inserción fue exitosa
            if ($insertLista->affected_rows > 0) {
                $exito = "¡Lista creada con éxito! Recarga la página para verla";
            } else {
                $error = "Error al crear la lista";
            }

            // Cerrar la consulta
            $insertLista->close();

            // Cerrar la conexión
            $conexion->close();
        }
    } else {
        $error = "Datos no encontrados";
    }

} catch (Exception $ex) {
    $error = $ex->getMessage();
}

// Si hay error, los devolvemos como JSON y detenemos la ejecución
if (isset($error)) {
    echo json_encode(["success" => false, "error" => $error]);
} else if (isset($exito)) {
    // Si todo está bien, continuamos con el registro
    echo json_encode(["success" => true, "exito" => $exito]);
}
exit();