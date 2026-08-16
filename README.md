# App Boilerplate

> **Proyecto Histórico:** Un framework ligero para aplicaciones de escritorio en Windows basado en **HTML Application (HTA)**, **ActiveX** y **jQuery 1.12.4**, desarrollado en la era previa a Electron y NW.js.

---

## Descripción Histórica

Antes de la popularización de runtimes modernos como Electron o Tauri, crear aplicaciones de escritorio con tecnologías web (HTML, CSS, JS, etc.) en Windows era posible mediante el motor Trident de Internet Explorer a través de archivos `.hta` (*HTML Applications*). Incluso en la actualidad se puede crear y ejecutar estas aplicaciones, aunque no es aconsejable desarrollar con HTA actualmente.

**Default 7** (perfeccionado paulatinamente desde aprox. 2010) fue diseñado como una plantilla/boilerplate modular reutilizable que otorga a las aplicaciones web privilegios nativos del sistema operativo sin necesidad de instalar dependencias externas ni entornos de ejecución pesados.

---

## Características Técnicas del Framework

* **Ventana sin bordes (*Frameless Window*):** Reemplazo de la barra de título nativa de Windows por una barra personalizada con controles propios de minimizar, maximizar y cerrar.
* **Cinemática de Ventanas en JavaScript:** Algoritmos de movimiento (`Application.move`) y redimensionamiento (`Application.dimension`) con cálculo vectorial y suavizado mediante `Math.sqrt`.
* **Sistema de Menús Anidados (*Flyout Menus*):** Motor de menús desplegables multinivel con detección de límites de pantalla y tolerancia de cursor (*hover intent*).
* **Persistencia Flat-File (`Rec`):** Mini motor de base de datos plana delimitada por registros clave-valor sin dependencias.
* **Control de Instancia Única (*Single Instance*):** Detección de instancias concurrentes y bloqueo mediante archivos *phantom* locales.
* **Acceso Nativo al Sistema:** Integración con `Scripting.FileSystemObject` y `WScript.Shell` para operaciones de archivos, logs de error y diálogos nativos.

---

## 📁 Estructura del Proyecto

```text
app-boilerplate-2013-hta/
├── data-v7/
│   ├── default.js                     # Núcleo del framework (Ventanas, Eventos, ActiveX, Menús)
│   ├── jquery.js                      # jQuery v1.12.4 (Última versión con soporte para IE legacy)
│   ├── style.css                      # Reset CSS y estilos de la interfaz de usuario
│   └── icon.png                       # Icono de la barra de título
├── Default.hta                        # Punto de entrada / Ventana principal de la aplicación
└── Default-old-version-app-example/   # Aplicación de ejemplo histórico (v1.x)
    └── Real-Old-App-Example.hta
```

---

## Cómo Ejecutar

1. Clona este repositorio en cualquier equipo con **Windows (XP, 7, 8, 10 u 11)**:
   ```bash
   git clone https://github.com/okzgn/app-boilerplate-2013-hta.git
   ```
2. Haz doble clic sobre `Default.hta` (se ejecutará de forma nativa mediante `mshta.exe`).

> **Nota de compatibilidad:** Los entornos modernos de Windows o antivirus empresariales pueden restringir la ejecución de archivos `.hta` por motivos de seguridad relacionados con el acceso irrestricto de ActiveX al sistema de archivos.

---

## Licencia

Desarrollado por Elías Alvarado Soshina (2010-2013), actualmente [OKZGN](https://okzgn.com).
