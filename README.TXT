=========================================================
## Iniciar la aplicación

Antes de comenzar, asegúrate de que **Docker Desktop esté abierto y en funcionamiento** en tu PC.  
Sin Docker corriendo, la aplicación no podrá levantarse.

Para levantar el entorno con Docker, ejecuta el siguiente comando en la terminal:

    docker-compose up --build -d

**Importante:** La imagen de Docker **no incluye la carpeta `vendor/`**, por lo tanto:

- Si deseas usar la funcionalidad de recuperación de contraseña (correo SMTP), **necesitas tener Composer instalado en tu PC**.
- Si no te interesa esa funcionalidad, puedes omitir este paso.

Puedes descargar Composer desde:
https://getcomposer.org/download/

Luego, dentro del proyecto, ejecuta:

    composer install

Esto instalará las dependencias necesarias en la carpeta `vendor/`.

Accede a la página web en: http://localhost:5500

Para acceder al panel de administración, utiliza las siguientes credenciales:

    Correo: admin@gmail.com  
    Contraseña: Mygameslist2425!

¡Gracias y que disfrutes de la aplicación!
=========================================================
