#include <SoftwareSerial.h>


// Configuración del módulo Bluetooth HC-05/06
// Pin 10 como RX (recibe datos de BT)
// Pin 11 como TX (envía datos a BT)
SoftwareSerial BT(10, 11);
String mensaje = "";


// Pines de señales PWM (Aunque se usarán como HIGH/LOW en este ejemplo)
const int ena = 7; // ENA (Habilitación Motor A)
const int enb = 9; // ENB (Habilitación Motor B - Es un pin PWM)


// Pines de control de dirección para el L298N
// Motor A (Izquierdo)
const int in1 = 6;
const int in2 = 5;
// Motor B (Derecho)
const int in3 = 4;
const int in4 = 8;


/**
* Función adelante: Mueve ambos motores hacia adelante.
*/
void adelante() {
 // Motor A (Izquierdo) - Hacia adelante
 digitalWrite(in1, HIGH);
 digitalWrite(in2, LOW);
 // Motor B (Derecho) - Hacia adelante
 digitalWrite(in3, HIGH);
 digitalWrite(in4, LOW);
 Serial.println("Movimiento: ADELANTE");
}


/**
* Función atras: Mueve ambos motores hacia atrás.
*/
void atras() {
 // Motor A (Izquierdo) - Hacia atrás
 digitalWrite(in1, LOW);
 digitalWrite(in2, HIGH);
 // Motor B (Derecho) - Hacia atrás
 digitalWrite(in3, LOW);
 digitalWrite(in4, HIGH);
 Serial.println("Movimiento: ATRAS");
}


/**
* Función derecha: Gira a la derecha (e.g., Izquierdo adelante, Derecho atrás).
*/
void derecha() {
 // Motor A (Izquierdo) - Hacia adelante
 digitalWrite(in1, HIGH);
 digitalWrite(in2, LOW);
 // Motor B (Derecho) - Hacia atrás (Giro)
 digitalWrite(in3, LOW);
 digitalWrite(in4, HIGH);
 Serial.println("Movimiento: DERECHA (Pivot)");
}


/**
* Función izquierda: Gira a la izquierda (e.g., Izquierdo atrás, Derecho adelante).
*/
void izquierda() {
 // Motor A (Izquierdo) - Hacia atrás (Giro)
 digitalWrite(in1, LOW);
 digitalWrite(in2, HIGH);
 // Motor B (Derecho) - Hacia adelante
 digitalWrite(in3, HIGH);
 digitalWrite(in4, LOW);
 Serial.println("Movimiento: IZQUIERDA (Pivot)");
}


/**
* Función parar: Detiene los motores usando frenado activo (ambos pines HIGH).
*/
void parar() {
 // Motor A (Izquierdo) - Freno
 digitalWrite(in1, HIGH);
 digitalWrite(in2, HIGH);
 // Motor B (Derecho) - Freno
 digitalWrite(in3, HIGH);
 digitalWrite(in4, HIGH);
 Serial.println("Movimiento: STOP (Frenado Activo)");
}


/**
* Función setup: se ejecuta una vez cuando encendemos el arduino
*/
void setup() {
 // iniciar puerto serie y bluetooth
 Serial.begin(9600);
 BT.begin(9600);


 Serial.println("🟢 HC-05 listo. Conectate desde el celular y enviá mensajes.");
 Serial.println(F("----------------------------------------------------"));
 Serial.println(F("           L298N - CONTROL DE MOTORES             "));
 Serial.println(F("----------------------------------------------------"));


 // Configurar pines de control de motores como salidas
 pinMode(ena, OUTPUT);
 pinMode(enb, OUTPUT);
 pinMode(in1, OUTPUT);
 pinMode(in2, OUTPUT);
 pinMode(in3, OUTPUT);
 pinMode(in4, OUTPUT);


 // Habilitar los puentes H a velocidad máxima (HIGH)
 // Si quisieras control PWM, usarías analogWrite(ena, 0-255);
 digitalWrite(ena, HIGH);
 digitalWrite(enb, HIGH);


 // Detener ambos motores al inicio (freewheel/coast)
 digitalWrite(in1, LOW);
 digitalWrite(in2, LOW);
 digitalWrite(in3, LOW);
 digitalWrite(in4, LOW);
}


/**
* Función loop: se ejecuta continuamente mientras el arduino permanece encendido
*/
void loop() {
 // Si hay datos desde el Bluetooth → procesarlos
 if (BT.available()) {
   char c = BT.read();
   mensaje += c;


   // Fin de mensaje (por ejemplo, al presionar Enter o recibir un comando completo)
   if (c == '\n' || c == '\r') {
     mensaje.trim();
     Serial.print("📩 Mensaje recibido: ");
     Serial.println(mensaje);


     // Bloque de Comandos de Movimiento
     if (mensaje.equalsIgnoreCase("a")) {
       adelante();
       BT.println("ADELANTE"); // Respuesta correcta
     }
     else if (mensaje.equalsIgnoreCase("ATRAS")) {
       atras();
       BT.println("ATRAS"); // Respuesta correcta
     }
     else if (mensaje.equalsIgnoreCase("IZQUIERDA")) {
       izquierda();
       BT.println("IZQUIERDA"); // Respuesta correcta
     }
     else if (mensaje.equalsIgnoreCase("DERECHA")) {
       derecha();
       BT.println("DERECHA"); // Respuesta correcta
     }
     else if (mensaje.equalsIgnoreCase("s")) {
       parar();
       BT.println("STOP"); // Respuesta correcta
     }
     else {
       BT.println("Comando desconocido: " + mensaje);
     }


     mensaje = ""; // limpiar buffer
   }
 }


 // Si escribís algo en el monitor serie → lo envía al celular
 if (Serial.available()) {
   BT.write(Serial.read());
 }
}
