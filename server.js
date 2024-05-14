const http = require('http');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

// Configurar body-parser para procesar los datos de formulario
const urlencodedParser = bodyParser.urlencoded({ extended: false });

// Ruta del archivo JSON donde se almacenarán los votos
const votosFilePath = path.join(__dirname, 'votos.json');

// Función para manejar las solicitudes HTTP
const requestHandler = (request, response) => {
    if (request.method === 'GET') {
        // Servir el formulario HTML en una solicitud GET
        if (request.url === '/' || request.url === '/index.html') {
            fs.readFile('./index.html', (err, content) => {
                if (err) {
                    response.writeHead(500);
                    response.end('Error interno del servidor');
                } else {
                    response.writeHead(200, { 'Content-Type': 'text/html' });
                    response.end(content, 'utf-8');
                }
            });
        } else if (request.url === '/styles.css') {
            // Servir el archivo CSS en una solicitud GET
            const cssFilePath = path.join(__dirname, 'styles.css');
            serveStaticFile(request, response, cssFilePath, 'text/css');
        }
    } else if (request.method === 'POST') {
        // Procesar los datos enviados desde el formulario en una solicitud POST
        let body = '';
        request.on('data', (chunk) => {
            body += chunk.toString();
        });

        request.on('end', () => {
            const formData = new URLSearchParams(body);
            const nombre = formData.get('nombre');
            const equipos = [
                { nombre: 'Equipo 1', voto: parseInt(formData.get('voto1')) },
                { nombre: 'Equipo 2', voto: parseInt(formData.get('voto2')) },
                { nombre: 'Equipo 3', voto: parseInt(formData.get('voto3')) },
                { nombre: 'Equipo 4', voto: parseInt(formData.get('voto4')) },
                { nombre: 'Equipo 5', voto: parseInt(formData.get('voto5')) }
            ];

            // Leer datos existentes del archivo votos.json
            fs.readFile(votosFilePath, (err, data) => {
                let votos = [];
                if (!err) {
                    try {
                        votos = JSON.parse(data);
                    } catch (error) {
                        console.error('Error al parsear votos.json:', error);
                    }
                }

                // Verificar si el usuario ya existe en los votos
                let usuarioExistenteIndex = votos.findIndex((voto) => voto.nombre === nombre);

                // Actualizar o agregar datos de votos del usuario
                if (usuarioExistenteIndex !== -1) {
                    // Usuario encontrado, actualizar sus votos
                    votos[usuarioExistenteIndex].equipos = equipos;
                } else {
                    // Usuario no encontrado, agregar nuevo conjunto de votos
                    votos.push({
                        nombre: nombre,
                        equipos: equipos
                    });
                }

                // Guardar el array actualizado en votos.json
                fs.writeFile(votosFilePath, JSON.stringify(votos, null, 2), (err) => {
                    if (err) {
                        response.writeHead(500);
                        response.end('Error interno del servidor al guardar los votos. Avisanos y vuelve a intentarlo.');
                    } else {
                        response.writeHead(200, { 'Content-Type': 'text/plain' });
                        response.end('¡Gracias por votar! Si no estás conforme con tu voto, puedes volver a votar.');
                    }
                });
            });
        });
    }
};

// Función para servir archivos estáticos
const serveStaticFile = (request, response, filePath, contentType) => {
    fs.readFile(filePath, (err, content) => {
        if (err) {
            response.writeHead(500);
            response.end('Error interno del servidor');
        } else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });
};

// Crear el servidor HTTP
const server = http.createServer(requestHandler);

// Definir el puerto en el que escuchará el servidor
const port = 4242;

// Iniciar el servidor y escuchar en el puerto especificado
server.listen(port, (err) => {
    if (err) {
        return console.error('Error al iniciar el servidor:', err);
    }

    console.log(`Servidor Node.js está escuchando en http://localhost:${port}/`);
});
