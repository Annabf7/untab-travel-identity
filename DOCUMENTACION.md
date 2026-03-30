# Documentación del sistema — UNTAB Travel Identity

> Guía completa del funcionamiento del sistema: formulario, scoring, perfil y targeta visual.
> Escrita para que cualquier persona pueda entender y modificar los datos sin tocar el código.

---

## Índice

1. [Visión general del flujo](#1-visión-general-del-flujo)
2. [El formulario — preguntas y campos](#2-el-formulario--preguntas-y-campos)
3. [El sistema de scoring — cómo se calculan los porcentajes](#3-el-sistema-de-scoring--cómo-se-calculan-los-porcentajes)
4. [Tabla de puntuaciones por pregunta y opción](#4-tabla-de-puntuaciones-por-pregunta-y-opción)
5. [De puntos a porcentajes](#5-de-puntos-a-porcentajes)
6. [Tribus y Micro ADN — cómo se asignan](#6-tribus-y-micro-adn--cómo-se-asignan)
7. [Tabla completa de Tribus y Micro ADN](#7-tabla-completa-de-tribus-y-micro-adn)
8. [La targeta visual — qué muestra y de dónde viene cada dato](#8-la-targeta-visual--qué-muestra-y-de-dónde-viene-cada-dato)
9. [Cómo modificar los datos desde Baserow (sin tocar código)](#9-cómo-modificar-los-datos-desde-baserow-sin-tocar-código)
10. [Estructura de las tablas de Baserow](#10-estructura-de-las-tablas-de-baserow)
11. [Preguntas frecuentes](#11-preguntas-frecuentes)

---

## 1. Visión general del flujo

El sistema funciona en 5 fases secuenciales:

```
FORMULARIO → SCORING → PERFIL → TARGETA VISUAL → DESCARGA
```

**En detalle:**

```
1. El usuario responde 12 preguntas
        ↓
2. 4 de esas preguntas tienen puntuaciones por opción
   (q4, q5, q6, q7 — las "preguntas de scoring")
        ↓
3. Se suman los puntos → 4 valores brutos (Exploración, Cultura, Placer, Calma)
        ↓
4. Se convierten a porcentajes (total = 100%)
        ↓
5. El eje dominante + el secundario determinan:
   → Tribu viajera (ej: "Nómadas del Horizonte")
   → Micro ADN (ej: "Atravesar límites, buscar lo excepcional")
        ↓
6. Todo se renderiza en una targeta 1080×1350 px
        ↓
7. El usuario descarga la imagen
```

---

## 2. El formulario — preguntas y campos

El formulario tiene **12 pasos**. Los primeros son datos descriptivos; las preguntas de scoring son q4, q5, q6 y q7.

| Paso | ID | Tipo | Pregunta | Uso |
|------|----|------|----------|-----|
| 1 | q1 | Texto libre | ¿Cómo te llamas? | Nombre en la targeta |
| 2 | q2 | Texto libre | ¿Algún destino en mente? | Info en la targeta |
| 2 | q3 | Texto libre | ¿Destinos que prefieras no repetir? | Info en la targeta |
| 3 | **q4** | Radio (1 opción) | Cuando recuerdas tus mejores viajes, ¿qué sensación predomina? | **SCORING** |
| 4 | **q5** | Checkbox (máx. 2) | ¿Qué tipo de experiencia o entorno te atrae más? | **SCORING** |
| 5 | **q6** | Radio (1 opción) | ¿Cómo te gusta vivir un destino cuando viajas? | **SCORING** |
| 6 | **q7** | Checkbox (máx. 2) | ¿Qué prefieres evitar en un viaje? | **SCORING** |
| 7 | q8 | Radio (1 opción) | ¿Cuánto tiempo te gustaría que durara el viaje? | Info en la targeta |
| 8 | q9 | Radio (1 opción) | ¿Qué presupuesto aproximado tienes? | Info en la targeta |
| 9 | q10 | Texto libre | ¿Cuándo te gustaría viajar? | Info en la targeta |
| 10 | q11 | Texto largo | ¿Hay algo más que deberíamos saber? | Info en la targeta |
| 11 | q12 | Email | ¿Cuál es tu correo electrónico? | Info en la targeta |

> **Nota:** q2 y q3 comparten el mismo paso visual (paso 2).

---

## 3. El sistema de scoring — cómo se calculan los porcentajes

Hay **4 ejes** de identidad viajera:

| Eje | Descripción |
|-----|-------------|
| **Exploración** | Aventura, naturaleza intensa, salir de la zona de confort |
| **Cultura** | Historia, formas de vida, ciudades con alma |
| **Placer** | Gastronomía, belleza, detalles, confort |
| **Calma** | Desconexión, lentitud, paisajes tranquilos |

Cada opción de las 4 preguntas de scoring suma puntos a uno o varios ejes. Las puntuaciones son **aditivas**: se suman todas las respuestas al final.

**Ejemplo de cálculo:**

```
Usuario elige:
  q4 → opción A ("Descubrir lugares que me hacen sentir pequeño")
  q5 → opciones A + D
  q6 → opción A
  q7 → opciones E + F

Puntos acumulados:
  q4-A:  exploracion+18, calma+6,  placer+3,  cultura+3
  q5-A:  exploracion+14, calma+4,  placer+2
  q5-D:  exploracion+16, placer+2, calma+2
  q6-A:  exploracion+16, cultura+2, placer+1, calma+1
  q7-E:  exploracion+6,  calma+3,  placer+1
  q7-F:  exploracion+5,  calma+3,  placer+1,  cultura-2
         ──────────────────────────────────────────────
  TOTAL: exploracion=75, calma=19, placer=10, cultura=3

Porcentajes (total = 107):
  Exploración = 75/107 = 70%
  Calma       = 19/107 = 18%
  Placer      = 10/107 =  9%
  Cultura     =  3/107 =  3%
```

> **Importante:** los valores negativos (como `cultura: -2` en q7-F) son posibles y restan puntos al eje. Los ejes negativos se tratan como 0 en el cálculo de porcentajes.

---

## 4. Tabla de puntuaciones por pregunta y opción

### Q4 — Sensación en tus mejores viajes (selección única)

| Opción | Texto | Exploración | Cultura | Placer | Calma |
|--------|-------|:-----------:|:-------:|:------:|:-----:|
| A | Descubrir lugares que me hacen sentir pequeño frente a la naturaleza | +18 | +3 | +3 | +6 |
| B | Sumergirme en culturas y formas de vida diferentes | +6 | +20 | +2 | +2 |
| C | Disfrutar de momentos de belleza, calma y desconexión | +2 | +2 | +10 | +16 |
| D | Vivir experiencias intensas que me saquen de mi zona de confort | +22 | +2 | +4 | +2 |
| E | Disfrutar del placer de la buena mesa, el vino, la conversación | — | +4 | +22 | +4 |
| F | Sentir que estoy en un lugar especial, diferente a todo | +8 | +6 | +12 | +4 |
| G | Otro | — | — | — | — |

---

### Q5 — Entorno o experiencia que te atrae (selección múltiple, máx. 2)

| Opción | Texto | Exploración | Cultura | Placer | Calma |
|--------|-------|:-----------:|:-------:|:------:|:-----:|
| A | Naturaleza espectacular | +14 | — | +2 | +4 |
| B | Lagos, bosques y naturaleza tranquila | +5 | — | +3 | +12 |
| C | Islas salvajes y paisajes marinos | +7 | — | +8 | +5 |
| D | Desiertos o paisajes extremos | +16 | — | +2 | +2 |
| E | Ciudades con historia y cultura | +2 | +14 | +4 | — |
| F | Playas y desconexión frente al mar | +2 | — | +8 | +10 |
| G | Aventuras activas en naturaleza | +17 | — | +1 | +2 |
| H | Destinos con una gastronomía excepcional | — | +3 | +16 | +1 |
| I | Otro | — | — | — | — |

---

### Q6 — Ritmo del viaje (selección única)

| Opción | Texto | Exploración | Cultura | Placer | Calma |
|--------|-------|:-----------:|:-------:|:------:|:-----:|
| A | Explorarlo activamente cada día | +16 | +2 | +1 | +1 |
| B | Combinar exploración con momentos tranquilos | +8 | +2 | +2 | +8 |
| C | Tomármelo con calma y disfrutar del lugar | +1 | +1 | +4 | +14 |
| D | Perderme sin demasiada planificación | +10 | +2 | +4 | +4 |
| E | Seguir experiencias bien seleccionadas | +2 | +6 | +8 | +4 |
| F | Otro | — | — | — | — |

---

### Q7 — Qué prefieres evitar (selección múltiple, máx. 2)

| Opción | Texto | Exploración | Cultura | Placer | Calma |
|--------|-------|:-----------:|:-------:|:------:|:-----:|
| A | Lugares masificados, artificiales o demasiado turísticos | +2 | +1 | +4 | +3 |
| B | Viajes excesivamente estructurados o con poco margen | +2 | +1 | +2 | +5 |
| C | Numerosos traslados o cambios de hotel | +1 | +1 | +2 | +6 |
| D | Alojamientos sin personalidad o encanto | — | +1 | +7 | +2 |
| E | Falta de contacto con naturaleza o paisajes | +6 | — | +1 | +3 |
| F | Destinos excesivamente urbanos | +5 | **-2** | +1 | +3 |
| G | Oferta gastronómica poco interesante | — | +1 | +8 | +1 |
| H | Pasar demasiado tiempo en actividades culturales intensivas | +3 | **-4** | +3 | +4 |
| I | Otro | — | — | — | — |

> **Nota:** Las opciones F y H de Q7 tienen valores **negativos** en Cultura. Esto refleja que el usuario quiere activamente evitar esos entornos.

---

## 5. De puntos a porcentajes

Una vez acumulados los puntos brutos, el sistema aplica esta fórmula:

```
porcentaje_eje = round( max(puntos_eje, 0) / suma_total_positivos × 100 )
```

**Reglas:**
- Los valores negativos se convierten a 0 antes de calcular el total
- Los 4 porcentajes suman siempre 100% (con posibles redondeos de ±1%)
- Si por algún motivo el total es 0, se asigna 25% a cada eje (fallback)

El eje con **mayor porcentaje** es el **eje dominante**.
El eje con **segundo mayor porcentaje** es el **eje secundario**.

Juntos forman la **clave** del perfil: `dominante_secundario`
(ej: `placer_exploracion`, `exploracion_cultura`, etc.)

---

## 6. Tribus y Micro ADN — cómo se asignan

Con la clave `dominante_secundario` se buscan dos valores en las tablas de identidad:

| Tabla | Qué devuelve | Ejemplo |
|-------|-------------|---------|
| **Tribu viajera** | El nombre de la tribu | "Nómadas del Horizonte" |
| **Micro ADN** | La frase de identidad | "Atravesar límites, buscar lo excepcional" |

Hay **10 combinaciones posibles** (cada eje puede ser dominante con cualquiera de los otros 3 como secundario, excluyendo empates). Los empates exactos son estadísticamente improbables dado el diseño de las puntuaciones.

---

## 7. Tabla completa de Tribus y Micro ADN

| Eje dominante | Eje secundario | Tribu viajera | Micro ADN |
|:---:|:---:|---|---|
| Placer | Exploración | Nómadas del Horizonte | Atravesar límites, buscar lo excepcional |
| Placer | Cultura | Curadores del Detalle | Buscar belleza, historia y lugares con alma |
| Placer | Calma | Refugio de lo Bello | Bajar el ritmo, afinar la mirada |
| Exploración | Placer | Buscadores de lo Extraordinario | Moverse lejos para sentir más |
| Exploración | Cultura | Cartógrafos del Mundo | Descubrir mundos y entender cómo se viven |
| Exploración | Calma | Aventureros del Silencio | Perderse en paisajes que lo cambian todo |
| Cultura | Placer | Coleccionistas de Alma | Encontrar emoción en lo auténtico y lo bello |
| Cultura | Exploración | Exploradores de Civilizaciones | Seguir la huella de otros mundos |
| Calma | Placer | Guardianes del Ritmo | Habitar lo bello sin prisa |
| Calma | Cultura | Habitantes del Tiempo Lento | Viajar hondo, lento y con sentido |

---

## 8. La targeta visual — qué muestra y de dónde viene cada dato

La targeta es una imagen de **1080 × 1350 píxeles** generada con p5.js.

| Elemento visual | Dato mostrado | Origen |
|----------------|---------------|--------|
| Nombre | q1 (nombre del usuario) | Formulario |
| Destino deseado | q2 | Formulario |
| Ejes con porcentajes | normalizedAxes (Exploración, Cultura, Placer, Calma) | Calculado por scoring |
| Tribu viajera | tribe | Tabla Tribus (Baserow o mock) |
| Micro ADN | microADN | Tabla Micro ADN (Baserow o mock) |
| Nebulosa de estrellas | Forma y densidad según % de cada eje | Calculado — eje con más % tiene más puntos y mayor alcance |
| Cruces de ejes | Posición fija en el centro geométrico | Fija, no cambia |

**La nebulosa:** cada eje ocupa una esquina del canvas (Exploración = arriba izquierda, Cultura = arriba derecha, Placer = abajo izquierda, Calma = abajo derecha). El número de puntos y la distancia que alcanzan desde el centro es proporcional al porcentaje de cada eje.

---

## 9. Cómo modificar los datos desde Baserow (sin tocar código)

Baserow es la fuente de datos en producción. Raquel puede editar todos los valores de scoring, tribus y micro ADN directamente desde la interfaz de Baserow, sin abrir ningún fichero de código.

### Acceso

URL: [https://baserow.io](https://baserow.io) → iniciar sesión con las credenciales del proyecto.

El proyecto tiene **2 tablas:**

| Tabla | ID | Qué contiene |
|-------|----|-------------|
| `scoring` | 902048 | Puntuaciones por pregunta y opción |
| `tribes` | 902068 | Tribus y Micro ADN por combinación de ejes |

### Activar/desactivar una fila

Cada fila tiene una columna **`active`** (checkbox). Si está marcada → el sistema la usa. Si no → la ignora. Esto permite desactivar opciones sin borrarlas.

---

## 10. Estructura de las tablas de Baserow

### Tabla `scoring` — una fila por cada opción de cada pregunta

| Columna | Tipo | Descripción | Valores posibles |
|---------|------|-------------|-----------------|
| `question_slug` | Texto | Identificador de la pregunta | `sensacion_mejores_viajes`, `entorno_preferido`, `ritmo_viaje`, `evitar_en_viaje` |
| `option_key` | Texto | Letra de la opción | `A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I` |
| `exploracion` | Número | Puntos que suma al eje Exploración | Entero (puede ser negativo) |
| `cultura` | Número | Puntos que suma al eje Cultura | Entero (puede ser negativo) |
| `placer` | Número | Puntos que suma al eje Placer | Entero (puede ser negativo) |
| `calma` | Número | Puntos que suma al eje Calma | Entero (puede ser negativo) |
| `active` | Checkbox | Si la fila está activa | ✓ / — |

**Ejemplo de filas:**

| question_slug | option_key | exploracion | cultura | placer | calma | active |
|---|---|---|---|---|---|---|
| sensacion_mejores_viajes | A | 18 | 3 | 3 | 6 | ✓ |
| sensacion_mejores_viajes | B | 6 | 20 | 2 | 2 | ✓ |
| entorno_preferido | A | 14 | 0 | 2 | 4 | ✓ |
| evitar_en_viaje | F | 5 | -2 | 1 | 3 | ✓ |

**Para cambiar una puntuación:** edita directamente el número en la celda correspondiente.

---

### Tabla `tribes` — una fila por cada combinación de ejes

| Columna | Tipo | Descripción | Valores posibles |
|---------|------|-------------|-----------------|
| `dominant` | Texto | Eje dominante | `exploracion`, `cultura`, `placer`, `calma` |
| `secondary` | Texto | Eje secundario | `exploracion`, `cultura`, `placer`, `calma` |
| `tribe` | Texto | Nombre de la tribu viajera | Texto libre |
| `micro_adn` | Texto | Frase de Micro ADN | Texto libre |
| `active` | Checkbox | Si la fila está activa | ✓ / — |

**Ejemplo de filas:**

| dominant | secondary | tribe | micro_adn | active |
|---|---|---|---|---|
| placer | exploracion | Nómadas del Horizonte | Atravesar límites, buscar lo excepcional | ✓ |
| exploracion | cultura | Cartógrafos del Mundo | Descubrir mundos y entender cómo se viven | ✓ |
| calma | cultura | Habitantes del Tiempo Lento | Viajar hondo, lento y con sentido | ✓ |

**Para cambiar el nombre de una tribu o la frase de Micro ADN:** edita directamente la celda `tribe` o `micro_adn` de la fila correspondiente.

> **Importante:** los valores de `dominant` y `secondary` deben estar escritos exactamente en minúsculas y en castellano: `exploracion` (sin tilde), `cultura`, `placer`, `calma`.

---

## 11. Preguntas frecuentes

**¿Qué pasa si el usuario elige "Otro" en alguna pregunta?**
Las opciones `G` e `I` marcadas como "Otro" no suman puntos a ningún eje (valores vacíos). No afectan al resultado.

**¿Puede haber un empate entre ejes?**
Técnicamente sí, pero es muy improbable dado el diseño de las puntuaciones. Si ocurre, el sistema usa el orden de comparación `exploracion > cultura > placer > calma` (el primero en el array gana).

**¿Los cambios en Baserow se aplican en tiempo real?**
Sí. Cada vez que un usuario inicia el formulario, el sistema carga las reglas desde Baserow en ese momento. No hay caché de datos.

**¿Qué pasa si Baserow no está disponible?**
El sistema tiene un fallback automático: si la llamada a Baserow falla, usa los datos mock locales (los valores hardcodeados en los ficheros `data/scoring.js`, `data/tribes.js` y `data/dna.js`). El usuario no nota la diferencia.

**¿Se guardan las respuestas del usuario en algún lugar?**
No. El sistema es 100% frontend — los datos solo existen en la memoria del navegador durante la sesión. No hay base de datos de usuarios.

**¿Cómo puedo añadir una nueva tribu?**
Añade una fila nueva en la tabla `tribes` de Baserow con el `dominant` y `secondary` que quieras, escribe el `tribe` y el `micro_adn`, y marca `active`. No hace falta tocar ningún código.

**¿Puedo cambiar los textos de las preguntas del formulario?**
Eso sí requiere editar código — concretamente el fichero `ui/form.js`. Los textos del formulario no están en Baserow.
