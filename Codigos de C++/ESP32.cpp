#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>
#include <Stepper.h>
#include <vector>  // <-- ¡NUEVO! Para la cola de comandos


// --- Configuración WiFi ---
const char* ssid = "PEINE-2";         // Pon tu nombre de red WiFi aquí
const char* password = "etecPeine2";  // Pon tu contraseña de WiFi aquí
// --------------------------
WebServer server(80);  // Crea un objeto servidor en el puerto 80


// --- Configuración de Pines del Auto (Tus Pines) ---
const int IN1A = 18;  // IO18 -> IN1A
const int IN2A = 2;   // IO2  -> IN2A
const int IN1B = 19;  // IO19 -> IN1B
const int IN2B = 16;  // IO16 -> IN2B
const int ENA = 4;    // IO4  -> ENA
const int ENB = 17;   // IO17 -> ENB


// --- Configuración de Pines del Stepper (Tus Pines) ---
const int ST1 = 27;
const int ST2 = 26;
const int ST3 = 25;
const int ST4 = 33;


// --- CORRECCIÓN IMPORTANTE ---
// 28BYJ-48 tiene engranajes. Su valor es 2048 (o 2038), no 200.
const int STEPS_PER_REVOLUTION = 2048;


// Duración de cada paso de la secuencia (en milisegundos)
const int MOVEMENT_DURATION_MS = 1000;  // 1 segundo por cada comando


// --- CORRECCIÓN DE ORDEN DE PINES ---
// La librería Stepper.h a menudo necesita el orden 1-3-2-4 para el driver ULN2003
Stepper myStepper(STEPS_PER_REVOLUTION, ST1, ST3, ST2, ST4);


// --- COLA DE COMANDOS (NUEVO) ---
std::vector<String> commandQueue;


// --- Funciones de Control DC (Tus Funciones) ---


void detenerMotores() {
 // Tu lógica de "freno" (HIGH, HIGH) está bien.
 digitalWrite(IN1A, HIGH);
 digitalWrite(IN2A, HIGH);
 digitalWrite(IN1B, HIGH);
 digitalWrite(IN2B, HIGH);
}
void atrasMotores() {
 digitalWrite(IN1A, LOW);
 digitalWrite(IN2A, HIGH);
 digitalWrite(IN1B, LOW);
 digitalWrite(IN2B, HIGH);
}
void adelanteMotores() {
 digitalWrite(IN1A, HIGH);
 digitalWrite(IN2A, LOW);
 digitalWrite(IN1B, HIGH);
 digitalWrite(IN2B, LOW);
}


// --- MODIFICADAS --- (Quitamos el delay y el parámetro)
void girarDerecha(int tiempodelay) {
 digitalWrite(IN1A, LOW);
 digitalWrite(IN2A, HIGH);
 digitalWrite(IN1B, HIGH);
 digitalWrite(IN2B, LOW);
 delay(tiempodelay);
 detenerMotores();
}
void girarIzquierda(int tiempodelay) {
 digitalWrite(IN1A, HIGH);
 digitalWrite(IN2A, LOW);
 digitalWrite(IN1B, LOW);
 digitalWrite(IN2B, HIGH);
 delay(tiempodelay);
 detenerMotores();
}


// Ya no se usa. La lógica ahora está en handleRunSequence
// void processMotorCommand(String direction) { ... }




// --- Handlers del Servidor Web (MODIFICADOS) ---


void handleRoot() {
 String html = "<h1>Servidor ESP32 - Modo Secuencia</h1>";
 html += "<p>Usa <b>/add?dir=[f,b,l,r,s]</b> para anadir un comando a la cola.</p>";
 html += "<p>Usa <b>/run</b> para ejecutar la secuencia.</p>";
 html += "<p>Usa <b>/clear</b> para limpiar la cola.</p>";
 html += "<h2>Comandos en cola: " + String(commandQueue.size()) + "</h2>";
 html += "<p>";
 // Mostrar los comandos en la cola
 for (const String& cmd : commandQueue) {
   html += cmd + " &rarr; ";  // Flecha
 }
 html += "FIN</p>";


 server.send(200, "text/html", html);
}


// --- NUEVO HANDLER: Añadir comando a la cola ---
void handleAddCommand() {
 String direction = "";


 // Comprueba si el cliente envió datos (el cuerpo de la petición)
 if (server.hasArg("plain") == false) {
   server.send(400, "text/plain", "Error: Body vacio");
   return;
 }




 String body = server.arg("plain");  // Obtiene el cuerpo JSON como un String




 // Crea un documento JSON para deserializar el cuerpo
 StaticJsonDocument<200> doc;  // 200 bytes es un tamaño razonable
 DeserializationError error = deserializeJson(doc, body);




 if (error) {
   // Si el JSON es inválido
   Serial.print("Error al parsear JSON: ");
   Serial.println(error.c_str());
   server.send(400, "text/plain", "Error: JSON invalido");
   return;
 }




 if (doc.containsKey("dir")) {
   direction = doc["dir"].as<String>();
 } else {
   direction = "stop";
 }




 // Añadir el comando al vector (la cola)
 commandQueue.push_back(direction);


 String response = "Comando '" + direction + "' anadido a la cola. Total: " + String(commandQueue.size());
 Serial.println(response);


 // Enviar respuesta al cliente (y redirigir a la página principal)
 server.sendHeader("Location", "/");
 server.send(200, "text/plain", response);
}


// --- NUEVO HANDLER: Limpiar la cola ---
void handleClearQueue() {
 commandQueue.clear();
 Serial.println("Cola de comandos borrada.");


 // Enviar respuesta al cliente (y redirigir a la página principal)
 server.sendHeader("Location", "/");
 server.send(302, "text/plain", "Cola de comandos borrada.");
}


// --- NUEVO HANDLER: Ejecutar la secuencia ---
void handleRunSequence() {
 Serial.println("--- INICIANDO SECUENCIA ---");
 String response = "Iniciando secuencia de " + String(commandQueue.size()) + " comandos...";


 // Enviar respuesta al navegador ANTES de empezar el trabajo pesado
 server.send(200, "text/plain", response + " (El robot se esta moviendo. La pagina no se actualizara hasta que termine)");


 // --- 1. Ejecutar la secuencia de motores DC ---
 for (const String& cmd : commandQueue) {
   Serial.print("Ejecutando: ");
   Serial.println(cmd);


   if (cmd == "f") {
     adelanteMotores();
   } else if (cmd == "b") {
     atrasMotores();
   } else if (cmd == "l") {
     girarIzquierda(1000);
   } else if (cmd == "r") {
     girarDerecha(1000);
   } else if (cmd == "s") {
     detenerMotores();
   }


   // Esperar a que el comando se complete
   // No esperamos si el comando es 's' (stop)
   if (cmd != "s") {
     delay(MOVEMENT_DURATION_MS);
     detenerMotores();  // Detenerse (frenar) entre comandos
     delay(200);        // Pausa corta para que el freno actúe
   }
 }


 Serial.println("--- SECUENCIA DC TERMINADA ---");


 // --- 2. Ejecutar el movimiento de la torreta (Stepper) ---
 Serial.println("--- MOVIENDO TORRETA (STEPPER) ---");
 // Moverá una rotación completa. Cambia STEPS_PER_REVOLUTION si quieres otro valor
 myStepper.step(STEPS_PER_REVOLUTION);
 Serial.println("Movimiento de torreta completado.");


 Serial.println("--- SECUENCIA COMPLETA ---");


 // --- 3. Limpiar la cola ---
 commandQueue.clear();
 Serial.println("Cola de comandos borrada. Listo para la proxima.");
}


// --- SETUP: Se ejecuta una vez al encender ---
void setup() {
 Serial.begin(115200);
 Serial.println("--- Iniciando Servidor de Control por Secuencia ---");


 // Configurar pines de motores en puente H como SALIDA
 pinMode(IN1A, OUTPUT);
 pinMode(IN2A, OUTPUT);
 pinMode(IN1B, OUTPUT);
 pinMode(IN2B, OUTPUT);
 pinMode(ENA, OUTPUT);
 pinMode(ENB, OUTPUT);


 // Configurar pines del motor step by step como SALIDA
 pinMode(ST1, OUTPUT);
 pinMode(ST2, OUTPUT);
 pinMode(ST3, OUTPUT);
 pinMode(ST4, OUTPUT);


 //Velocidad del stepper (10-15 RPM es seguro)
 myStepper.setSpeed(10);


 //Pongo la velocidad de los motores del puente H al palo
 digitalWrite(ENA, HIGH);
 digitalWrite(ENB, HIGH);


 // Empezar con motores detenidos
 detenerMotores();


 // Conexión a WiFi
 Serial.print("Conectando a ");
 Serial.println(ssid);
 WiFi.begin(ssid, password);
 while (WiFi.status() != WL_CONNECTED) {
   delay(500);
   Serial.print(".");
 }


 Serial.println("\nWiFi conectado!");
 Serial.print("Dirección IP: ");
 Serial.println(WiFi.localIP());  // Imprime la IP de la ESP32


 // --- Definición de las NUEVAS rutas del servidor ---
 server.on("/", HTTP_GET, handleRoot);              // Ruta principal
 server.on("/add", HTTP_POST, handleAddCommand);    // Ruta para AÑADIR
 server.on("/run", HTTP_POST, handleRunSequence);   // Ruta para EJECUTAR
 server.on("/clear", HTTP_POST, handleClearQueue);  // Ruta para LIMPIAR


 // Iniciar el servidor
 server.begin();
 Serial.println("Servidor HTTP iniciado");
}


void loop() {
 server.handleClient();
}
