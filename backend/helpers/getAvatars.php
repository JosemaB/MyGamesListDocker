<?php
include_once '../config/cors.php';  // Incluye CORS para poder hacer la conexión con tu frontend

// La ruta de la carpeta donde están los avatares (ajusta la ruta según tu estructura de archivos)
$directory = '../../frontend/img/avatares/';

// Verifica si la carpeta existe
if (is_dir($directory)) {
    // Lee todos los archivos de la carpeta y filtra solo los archivos con extensiones de imagen
    $images = array_filter(scandir($directory), function ($file) use ($directory) {
        return preg_match('/\.(jpg|jpeg|png|webp|gif)$/i', $file) && strpos($file, 'sinAvatar') === false;;
    });

    // Agrega la ruta relativa de la imagen (sin la parte inicial de la ruta)
    $images = array_values(array_map(function ($image) {
        return '../../img/avatares/' . $image; // Solo devuelve la parte relativa
    }, $images));

    // Devolver la lista de imágenes en formato JSON
    echo json_encode($images);
} else {
    // Si la carpeta no existe, devuelve un mensaje de error
    echo json_encode(["error" => "La carpeta no existe."]);
}

