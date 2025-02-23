<?php
include_once '../../config/cors.php';  // Incluye CORS para poder hacer la conexión con tu frontend
include_once '../../config/ConexionBdd.php';  // Para la conexion de la base de datos MyGamesList
include_once '../funciones.php';

try {
    
    // Creamos la conexión a la base de datos
    $baseDeDatos = new ConexionBdd();
    $conexion = $baseDeDatos->getConnection();


    // Consulta 1: Obtener todos los usuarios
    $usuariosQuery = "SELECT id_usuario, nombre_usuario, avatar, id_rol FROM usuarios";
    $usuariosStmt = $conexion->prepare($usuariosQuery);
    $usuariosStmt->execute();
    $usuariosResult = $usuariosStmt->get_result();

    // Arreglo para almacenar los usuarios
    $usuarios = [];
    while ($usuario = $usuariosResult->fetch_assoc()) {
        // Agregar las listas al usuario
        $usuarios[] = $usuario; // Agregar el usuario al arreglo
    }
    $usuariosStmt->close();


    // Consulta 2: Obtener todos las listas relacionadas con cada usuario
    $listasQuery = "SELECT u.nombre_usuario, l.id_lista, l.nombre_lista, l.fecha_creacion FROM usuarios u, listas l WHERE u.id_usuario = l.id_usuario";
    $listasStmt = $conexion->prepare($listasQuery);
    $listasStmt->execute();
    $listasResult = $listasStmt->get_result();

    $listas = [];
    while ($lista = $listasResult->fetch_assoc()) {

        $listas[] = $lista;
    }
    $listasStmt->close();


    // Consulta 3: Obtener todos las reseñas relacionadas con cada usuario
    $resenasQuery = "SELECT u.nombre_usuario, u.avatar, r.id_resena, r.img_juego, r.contenido, r.fecha_publicacion FROM usuarios u, resenas r WHERE u.id_usuario = r.id_usuario";
    $resenasStmt = $conexion->prepare($resenasQuery);
    $resenasStmt->execute();
    $resenasResult = $resenasStmt->get_result();

    $resenas = [];
    while ($resena = $resenasResult->fetch_assoc()) {

        $resenas[] = $resena;
    }
    $resenasStmt->close();

    // Crear un arreglo para el resultado
    $result = array(
        "usuarios" => $usuarios,
        "listas" => $listas,
        "resenas" => $resenas
    );

    // Devolvemos el resultado
    echo json_encode(["success" => true, "data" => $result]);
    // Cerrar la conexión
    $conexion->close();
} catch (Exception $e) {
    // Capturar cualquier error y devolverlo
    $error = $e->getMessage();
    echo json_encode(["success" => false, "error" => $error]);
}
exit();
