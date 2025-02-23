# Usar la imagen base de PHP con Apache
FROM php:8.2-apache

# Establecer el directorio de trabajo
WORKDIR /var/www/html

# Crear un directorio para las sesiones de PHP
RUN mkdir -p /var/lib/php/sessions
RUN chmod -R 777 /var/lib/php/sessions

# Copiar la configuración de PHP para usar el directorio persistente de sesiones
COPY php.ini /usr/local/etc/php/conf.d/custom.ini

# Instalar extensiones de PHP necesarias
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Habilitar módulos de Apache correctamente
RUN a2enmod rewrite && a2enmod headers

# Copiar la configuración personalizada de Apache
COPY ./apache.conf /etc/apache2/sites-available/000-default.conf

# Habilitar el sitio por defecto
RUN a2ensite 000-default.conf

# Copiar el código de la aplicación
COPY ./backend /var/www/html/backend

# Establecer permisos adecuados
RUN chown -R www-data:www-data /var/www/html && \
    chmod -R 755 /var/www/html

# Reiniciar Apache (opcional, en algunos casos necesario)
RUN service apache2 restart

# Exponer el puerto 80
EXPOSE 80

# Comando para iniciar Apache en primer plano
CMD ["apache2-foreground"]