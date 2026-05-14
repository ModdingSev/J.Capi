# Guía Paso a Paso para Desplegar J.Capi y Sincronizar con ClassicGes

¡Hola! Esta guía está preparada para que puedas montar todo el sistema sin conocimientos avanzados previos. Sigue los pasos uno a uno, en orden, y sin saltarte nada. Si algo te da error, lee bien el paso anterior por si se te olvidó algún detalle. ¡Vamos a ello!

---

## 🏗️ PARTE 1: Arrancar la web (Backend y Frontend)

Esto se hace en el servidor o en el ordenador principal donde va a estar alojada la página web.

### Paso 1: Descargar el proyecto
Necesitas tener la carpeta del proyecto (llamada `J.Capi`) en tu ordenador. 
- Si usáis un repositorio (Github, Gitlab), abre una terminal/consola y clónalo.
- Si te han pasado un archivo ZIP, simplemente descomprímelo en una carpeta normal (por ejemplo, en tus Documentos).

### Paso 2: Instalar Docker
Para que la web y la base de datos funcionen sin que te vuelvas loco instalando y configurando mil cosas, usamos un programa llamado **Docker**.
1. Ve a [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
2. Descárgalo y lo instalas (es darle a siguiente, siguiente, siguiente).
3. Ábrelo. Espera un poco hasta que el icono de la ballena se ponga verde o diga "Running" (Ejecutándose).

### Paso 3: ¡Arrancar la web!
1. Abre tu consola de comandos (Terminal en Mac/Linux, o "Símbolo del sistema / CMD" en Windows).
2. Usa el comando `cd` para meterte en la carpeta donde tienes el proyecto. Ejemplo: `cd Documentos/J.Capi`
3. Escribe este comando mágico y pulsa Enter:
   ```bash
   docker-compose up --build -d
   ```
4. Va a tardar un ratito, descargando cosas y encendiendo los "motores" (Base de datos, Backend y Frontend). Déjalo trabajar.
5. Cuando termine y vuelva a salir la línea para escribir, abre tu navegador (Chrome, Firefox...) y entra en:
   **http://localhost:3000**
   
¡Ahí debería aparecer la web de la tienda de J.Capi funcionando perfectamente!

---

## 🕵️‍♂️ PARTE 2: Instalar el "Sincronizador" en la Tienda Física (Windows)

Ahora nos vamos al ordenador físico de la tienda, el que tiene el programa **ClassicGes** instalado. Este ordenador va a actuar como un "chivato" que le dice a la web qué productos hay y cuánto stock queda.

### Paso 1: Instalar Node.js
Para que el script sincronizador funcione, necesita un "motor" en Windows.
1. En el ordenador de la tienda, entra en [https://nodejs.org/](https://nodejs.org/)
2. Descarga la versión grande que dice "LTS" (Recomendada).
3. Instálalo dándole a todo a "Siguiente" (deja todas las opciones por defecto).

### Paso 2: Copiar el Sincronizador
1. De la carpeta principal del proyecto J.Capi que tienes, copia **SOLO** la carpeta llamada `agente-sync`.
2. Pásala al ordenador de la tienda (con un pendrive, por Google Drive, etc).
3. Guárdala en un sitio fácil de encontrar en el disco duro de la tienda, por ejemplo en el disco C:. Tiene que quedar así: `C:\agente-sync`

### Paso 3: Configurar el Sincronizador
1. Entra en esa carpeta `C:\agente-sync`.
2. Haz clic en la barra de direcciones de arriba (donde pone la ruta), borra lo que haya, escribe `cmd` y pulsa Enter. Se abrirá una ventana negra de consola.
3. Escribe esto y pulsa Enter:
   ```bash
   npm install
   ```
   *Esto descargará las piececitas extra que necesita el chivato para funcionar.*
4. Ahora, abre el archivo llamado `sync-agent.js` con el Bloc de notas (o Click derecho -> Abrir con -> Bloc de notas).
5. Ve a la línea 30 (aprox), verás unas variables importantes. ¡Tienes que cambiarlas!:
   - `DBF_FILE_PATH`: Tienes que buscar en qué carpeta exacta guarda el programa ClassicGes el archivo de artículos. Suele ser algo como `C:\ClassicGes6\Datos\ARTICULOS.DBF`. Cámbialo por la ruta real.
   - `API_URL`: Aquí debes poner la dirección real de la API de la web. De momento pondrá `http://localhost:4000/api/sync`. Si ya tenéis la web subida a internet de verdad, pon algo como `https://web-jcapi.com/api/sync`.
6. Guarda el archivo (Archivo -> Guardar) y ciérralo.

### Paso 4: Prueba manual
1. Vuelve a la ventanita negra de consola que abriste antes (la que está en `C:\agente-sync`).
2. Escribe:
   ```bash
   node sync-agent.js
   ```
3. Lee lo que sale. Si todo va bien, pondrá "Leyendo archivo...", "Enviando lotes..." y finalmente "✅ SINCRONIZACIÓN COMPLETADA". ¡Significa que los productos acaban de enviarse a la web!

---

## 🤖 PARTE 3: Automatizar el trabajo (Que se haga solo)

No queremos que el de la tienda tenga que darle a un botón cada hora. Vamos a decirle a Windows que lo haga en secreto.

### Paso 1: Crear el ejecutable (.bat)
1. Dentro de la carpeta `C:\agente-sync`, haz clic derecho en un espacio en blanco -> Nuevo -> Documento de texto.
2. Llámalo `ejecutar_sincronizacion.bat` (Cuidado: borra el `.txt` del final. Si tu Windows no te muestra el `.txt`, busca en Google "Cómo mostrar extensiones de archivo en Windows" y hazlo primero).
3. Haz clic derecho sobre tu nuevo archivo `.bat` y dale a "Editar" (o Abrir con Bloc de notas).
4. Pega exactamente esto:
   ```bat
   @echo off
   cd /d C:\agente-sync
   node sync-agent.js >> registro_errores.txt 2>&1
   ```
5. Guarda y cierra.

### Paso 2: Programar la Tarea en Windows
1. En el buscador del menú de inicio de Windows, escribe **"Programador de tareas"** y ábrelo.
2. En el menú de la derecha, haz clic en **"Crear tarea..."** (Ojo, NO la que dice "básica").
3. **Pestaña General:**
   - Nombre: `Sincronizador Web J.Capi`
   - Marca la opción: "Ejecutar tanto si el usuario ha iniciado sesión como si no" (importantísimo).
   - Marca la opción: "Ejecutar con los privilegios más altos".
   - Marca la opción: "Oculta".
4. **Pestaña Desencadenadores:**
   - Abajo dale a "Nuevo...".
   - En "Iniciar la tarea", elige: "Según una programación".
   - Marca "Diariamente".
   - Abajo, marca la casilla "Repetir la tarea cada:" y en el desplegable elige **1 hora**.
   - A la derecha de eso, en "durante:" elige **Indefinidamente**.
   - Aceptar.
5. **Pestaña Acciones:**
   - Abajo dale a "Nuevo...".
   - Acción: "Iniciar un programa".
   - En Programa/script dale al botón Examinar y busca el archivo `C:\agente-sync\ejecutar_sincronizacion.bat`.
   - **MUY IMPORTANTE**: En la casilla "Iniciar en (opcional)" escribe la ruta de la carpeta: `C:\agente-sync\` (no te olvides de la barra final).
   - Aceptar.
6. Dale a **Aceptar** abajo del todo.
7. Te pedirá la contraseña del ordenador (la que usan para iniciar sesión en ese Windows). Ponla y acepta.

---

## 🎉 ¡FIN! ¿Cómo funciona el día a día?

A partir de ahora, el flujo es mágico:
1. En la tienda física venden un frigorífico. El programa ClassicGes anota automáticamente que hay 1 menos en stock.
2. Sin que nadie toque nada, cuando llegue la hora en punto, Windows ejecuta silenciosamente el Sincronizador.
3. El Sincronizador mira los datos de ClassicGes y envía el nuevo stock a la web.
4. La web actualiza el stock al instante.

### ¿Qué pasa si quiero que se actualice ¡YA!?
Si han vendido algo muy importante y no quieren esperar a que pase una hora, solo tienen que ir a la carpeta `C:\agente-sync` y hacer doble clic rápido sobre el archivo `ejecutar_sincronizacion.bat`. Se sincronizará en ese mismo instante.

### ¿Cómo sé si algo ha fallado?
Si sospechas que algo no va bien, ve a la carpeta `C:\agente-sync`. Verás un archivo llamado `registro_errores.txt`. Ábrelo y mira las últimas líneas. Ahí te dirá si se ha cortado internet, si ha cambiado la ruta del archivo de ClassicGes, etc.
