# [cite_start]Proyecto Robot Móvil [cite: 1]

## 📋 Tabla de Contenidos
* [Descripción General](#-descripción-general)
    * [Aclaración de Control](#aclaración-de-control)
* [Metas del Proyecto](#-metas-del-proyecto)
* [Proyectos y Componentes](#-proyectos-y-componentes)
    * [Proyecto con Arduino UNO](#proyecto-con-arduino-uno)
    * [Proyecto con ESP32 (Alternativa WiFi)](#proyecto-con-esp32-alternativa-wifi)
* [Historial de Reuniones y Resoluciones](#-historial-de-reuniones-y-resoluciones)
* [Referencias](#-referencias)

---

## [cite_start]💡 Descripción General [cite: 2]

[cite_start]Necesitamos que un robot movilizado con ruedas realice un recorrido por un terreno llano[cite: 3]. [cite_start]Finalizado su recorrido, tiene que capturar imágenes desde un celular para luego mandarlas a un repositorio[cite: 3].

### [cite_start]Aclaración de Control [cite: 4]

[cite_start]Para este proyecto, la idea es controlar este robot desde una aplicación móvil diseñada en el entorno de **Expo Go**[cite: 5]. [cite_start]De todas formas, esta documentación sirve para controlar al robot tanto desde la aplicación como desde una computadora siempre y cuando se envíen señales con método **POST**[cite: 5].

---

## [cite_start]🎯 Metas del Proyecto [cite: 6]

* [cite_start]Presentar este proyecto en la SET[cite: 7].
* [cite_start]Dejar documentación del proyecto para la continuación del mismo años posteriores[cite: 8].
* [cite_start]Desafiar los conocimientos adquiridos en estos años tanto en IoT como en el desarrollo de aplicaciones[cite: 9].

---

## ⚙️ Proyectos y Componentes

### [cite_start]Proyecto con Arduino UNO [cite: 44]

[cite_start]Este proyecto inicial contempló el uso de un módulo Bluetooth (HC-06 o HC-05) para la comunicación con la aplicación móvil[cite: 16, 19, 45].

#### [cite_start]Componentes de Arduino UNO con Módulo Bluetooth [cite: 45]

| Componente | Modelo | Cantidad | Funcionalidad/Motivo | Costo |
| :--- | :--- | :--- | :--- | :--- |
| Controlador | Arduino UNO | 1 | [cite_start]Recibir órdenes mediante señales bluetooth para accionar [cite: 46] | $11,300 |
| Módulo Bluetooth | HC-06 o HC-05 | 1 | [cite_start]Recibir las señales bluetooth de la aplicación móvil [cite: 46] | $5,700 |
| Puente H | L298n | 1 | [cite_start]Manejar las ruedas [cite: 46] | $6,400 |
| Motor | ? | 2 | [cite_start]Accionar las ruedas [cite: 46] | ? |
| Motor paso a paso | 28byj | 1 | [cite_start]Accionar la torreta del celular [cite: 46] | $4,200 |
| **Costo Total Estimado** | | | | **$30,400** |

#### [cite_start]Diagrama de bloques con Arduino [cite: 47]

* [cite_start]Arduino [cite: 48]
* [cite_start]Motores (ruedas) [cite: 49]
* [cite_start]Motor paso a paso [cite: 50]
* [cite_start]Módulo BT [cite: 51]
* [cite_start]Driver [cite: 52]
* [cite_start]Puente H [cite: 53]
* [cite_start]Aplicación [cite: 54]
* [cite_start]Batería [cite: 55]

### [cite_start]Proyecto con ESP32 (Alternativa WiFi) [cite: 56]

[cite_start]Esta alternativa se exploró tras encontrar problemas con la conexión Bluetooth[cite: 33]. [cite_start]La comunicación se realizaría mediante **WiFi** y el protocolo **MQTT**[cite: 33].

#### [cite_start]Componentes de ESP32 con Módulo WiFi [cite: 57]

| Componente | Modelo | Cantidad | Funcionalidad/Motivo | Costo |
| :--- | :--- | :--- | :--- | :--- |
| Controlador | ESP32 | 1 | [cite_start]Recibir órdenes con método POST por WiFi [cite: 58] | $12,400 |
| Puente H | L298n | 1 | [cite_start]Manejar las ruedas [cite: 58] | $6,400 |
| Motor | ? | 2 | [cite_start]Accionar las ruedas [cite: 58] | ? |
| Motor paso a paso | 28byj | 1 | [cite_start]Accionar la torreta del celular [cite: 58] | $4,200 |
| Driver | ULN2003 | 1 | [cite_start]Manejar el motor paso a paso [cite: 58] | $2,800 |
| **Costo Total Estimado** | | | | **$25,800** |

#### [cite_start]Diagrama de bloques con ESP32 [cite: 59]

* [cite_start]ESP32 [cite: 60]
* [cite_start]Motores (ruedas) [cite: 61]
* [cite_start]Motor paso a paso [cite: 62]
* [cite_start]Driver [cite: 63]
* [cite_start]Puente H [cite: 64]
* [cite_start]Aplicación [cite: 65]
* [cite_start]Batería [cite: 66]

---

## [cite_start]🗓️ Historial de Reuniones y Resoluciones [cite: 10]

### [cite_start]Primera Reunión (27/10) [cite: 11]

[cite_start]**Resoluciones:** [cite: 12]
* [cite_start]El robot va a funcionar como *dummy*[cite: 13].
* [cite_start]Necesitamos resolver el diseño de la posta con el *step by step*[cite: 14].
* [cite_start]Conexiones hechas con el Arduino UNO[cite: 15].
* [cite_start]Necesitamos un módulo Bluetooth para la conexión con la aplicación móvil[cite: 16].

[cite_start]**Componentes a usar:** [cite: 17]
* [cite_start]Arduino UNO [cite: 18]
* [cite_start]Modulo Bluetooth (HC-06 o HC-05) [cite: 19]
* [cite_start]Puente H (para control de motores de rueda) [cite: 20]
* [cite_start]2x Motores (de cada rueda) [cite: 21]
* [cite_start]1x Motor paso a paso (28byj) [cite: 22]
* [cite_start]1x Driver ULN2003 (para controlar motor paso a paso) [cite: 23]

### [cite_start]Segunda Reunión (28/10) [cite: 24]

[cite_start]**Resoluciones:** [cite: 25]
* [cite_start]Realizar un diagrama de bloques para entender el funcionamiento del proyecto[cite: 26].
* [cite_start]Realizar una tabla con: Tipo de componentes, Modelo de componente, Cantidad por componente, Funcionalidad en el proyecto, costo por componente y costo total[cite: 27].

### [cite_start]Tercera Reunión (29/10) [cite: 28]

[cite_start]**Resoluciones:** [cite: 29]
* [cite_start]Resolver los tiempos en los que se realizan las acciones (**delays**)[cite: 30].

### [cite_start]Cuarta Reunión (30/10) [cite: 31]

[cite_start]**Resoluciones:** [cite: 32]
* [cite_start]El proyecto fracasó para conectar con la instancia Bluetooth[cite: 33].
* [cite_start]La alternativa que encontramos para seguir con el proyecto es conectar un módulo WiFi con la placa Arduino UNO y realizar la comunicación mediante **MQTT**[cite: 33].
* [cite_start]Limpiar el código de conexiones Bluetooth (guardar el anterior por las dudas)[cite: 34].
* [cite_start]Consultar a Seba sobre las conexiones en MQTT[cite: 35].
* [cite_start]Investigar sobre la relación entre React y MQTT[cite: 36].

### [cite_start]Quinta Reunión (4/11) [cite: 37]

[cite_start]**Resoluciones:** [cite: 38]
* [cite_start]Investigar sobre la relación entre una aplicación móvil y la ESP32 directamente[cite: 39].
* [cite_start]Se acordó que la ESP32 debe generar una red WiFi propia (funcionaría en modo AP)[cite: 40].
* [cite_start]**Problema detectado:** Si se debe reportar una imagen a un servidor o la página web de la app depende de scripts/tecnologías que están en un servidor, esto no funcionará porque la red que genera la ESP32 es LAN (local) sin salida a internet[cite: 40].

[cite_start]**Opciones a considerar:** [cite: 41]
* [cite_start]Que la ESP32 funcione en modo **STA** (Station)[cite: 42].
* [cite_start]No consumir ningún dato/servicio de un *server* fuera de la red LOCAL generadora por la ESP32[cite: 43].

---

## [cite_start]🔗 Referencias [cite: 67]

* [cite_start]**Tutorial para conexión bluetooth con el código (Expo App):** [https://expo-dev.translate.goog/blog/how-to-build-a-bluetooth-low-energy-powered-expo-app?\_x\_tr\_sl=en&\_x\_tr\_tl=es&\_x\_tr\_hl=es&\_x\_tr\_pto=tc&\_x\_tr\_hist=true](https://expo-dev.translate.goog/blog/how-to-build-a-bluetooth-low-energy-powered-expo-app?_x_tr_sl=en&_x_tr_tl=es&_x_tr_hl=es&_x_tr_pto=tc&_x_tr_hist=true) [cite: 68]
    > [cite_start]*Nota: Copie el código del tutorial hasta antes de “solicitar permisos”[cite: 69].*
* [cite_start]**Cómo construir un API Rest con la ESP32:** [https://www.techrm.com/how-to-build-a-rest-api-server-with-esp32/](https://www.techrm.com/how-to-build-a-rest-api-server-with-esp32/) [cite: 70, 71]
* [cite_start]**Instalación de librerías en Arduino IDE:** [cite: 72]
    * [cite_start]ArduinoJson by benoit blanchon [cite: 73]
    * [cite_start][https://udea-iot.github.io/IoT\_2024-1/docs/sesiones/percepcion/sesion7f/](https://udea-iot.github.io/IoT_2024-1/docs/sesiones/percepcion/sesion7f/) [cite: 74]
