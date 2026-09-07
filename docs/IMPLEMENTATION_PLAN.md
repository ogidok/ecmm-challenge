# Implementation Plan — Catálogo de Productos

> **Source of truth:** [`README.md`](../README.md)

Este documento traduce todos los requisitos del README a tareas concretas de implementación. Cada sección referencia el requisito original. Nada en este plan agrega funcionalidades que no estén en el README.

---

## 1. Estructura del Proyecto

El esqueleto ya está preparado:

```
ecmm-challenge/
├── README.md
├── IMPLEMENTATION_PLAN.md
├── backend/                  # Django project (django-admin startproject backend)
│   ├── manage.py
│   ├── requirements.txt
│   ├── backend/              # Django settings module
│   │   ├── settings.py       # rest_framework, corsheaders, products registrados
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   └── products/             # Django app (python manage.py startapp products)
│       ├── models.py
│       ├── serializers.py    # [POR CREAR]
│       ├── views.py
│       ├── urls.py           # [POR CREAR]
│       ├── admin.py
│       ├── tests.py
│       └── migrations/
└── frontend/                 # Vite + React
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
```

---

## 2. Backend — Django + Django REST Framework

### 2.1 Modelos (`products/models.py`) — [COMPLETADO]

**Requisito README:** "Una categoría debe contener: nombre" / "Un producto debe contener: nombre, descripción, precio, stock, categoría, fecha de creación"

#### Modelo `Category`
| Campo   | Tipo           | Restricciones                               |
|---------|----------------|---------------------------------------------|
| `name`  | `CharField`    | `max_length=255`, `unique=True` (README: "El nombre de cada categoría debe ser único") |

#### Modelo `Product`
| Campo        | Tipo             | Restricciones                                                                      |
|--------------|------------------|-------------------------------------------------------------------------------------|
| `name`       | `CharField`      | `max_length=255`, obligatorio (README: "Nombre … son obligatorios")                |
| `description`| `TextField`      | Puede ser vacío/blank (README no dice obligatorio)                                 |
| `price`      | `DecimalField`   | `max_digits=10`, `decimal_places=2`, obligatorio, `>= 0` (README: "El precio debe ser mayor o igual a cero") |
| `stock`      | `IntegerField`   | Obligatorio, `>= 0`, entero (README: "El stock debe ser un entero mayor o igual a cero") |
| `category`   | `ForeignKey`     | A `Category`, `on_delete=PROTECT`, obligatorio (README: "La categoría asociada debe existir") |
| `created_at` | `DateTimeField`  | `auto_now_add=True` (README: "fecha de creación")                                  |

**Nota sobre `on_delete`:** El README no especifica qué hacer al eliminar una categoría con productos asociados. `PROTECT` es la decisión más segura (impide borrar la categoría si tiene productos). Se señala como **ambigüedad** — otra opción sería `CASCADE`.

### 2.2 Serializers (`products/serializers.py`) — [COMPLETADO]

**Requisito README:** "Uso adecuado de modelos, serializers y vistas"

#### `CategorySerializer`
- `ModelSerializer` para `Category`.
- Validar unicidad del nombre (ya cubierta por el modelo, el serializer propagará el error).

#### `ProductSerializer`
- `ModelSerializer` para `Product`.
- Campos: `id`, `name`, `description`, `price`, `stock`, `category`, `created_at`.
- `category` como `PrimaryKeyRelatedField` para escritura; opcionalmente representar el nombre de categoría en lectura.
- Validaciones:
  - `price >= 0` → `MinValueValidator(0)` o validación en serializer.
  - `stock >= 0` y entero → `MinValueValidator(0)`.
  - `category` debe existir → DRF lo valida automáticamente con `PrimaryKeyRelatedField`.
  - `name`, `price`, `stock`, `category` obligatorios → `required=True` (default en ModelSerializer si el campo no es blank/null).

**Requisito README:** "Los errores de validación deben devolver una respuesta HTTP apropiada y comprensible" → DRF retorna `400 Bad Request` con detalle por campo por defecto. Asegurar que los mensajes de error sean claros.

### 2.3 Vistas (`products/views.py`) — [COMPLETADO]

**Requisito README:** "Listar productos y consultar uno por su ID. Crear, editar y eliminar productos. Filtrar productos por categoría. Buscar productos por nombre."

#### `CategoryViewSet` (ModelViewSet)
- CRUD completo de categorías (necesario para poder asociar categorías a productos).
- README menciona que la categoría tiene un nombre y que debe existir al asociarla a un producto. Crear un CRUD de categorías es imprescindible para la funcionalidad, aunque el README no pide explícitamente una interfaz de gestión de categorías.

#### `ProductViewSet` (ModelViewSet)
- **Listar** (`GET /api/products/`) — listado de todos los productos.
- **Consultar por ID** (`GET /api/products/{id}/`) — detalle de un producto.
- **Crear** (`POST /api/products/`) — crear producto con validaciones.
- **Editar** (`PUT/PATCH /api/products/{id}/`) — actualizar producto.
- **Eliminar** (`DELETE /api/products/{id}/`) — eliminar producto.
- **Filtrar por categoría** — query param, ejemplo: `?category=ID`.
- **Buscar por nombre** — query param, ejemplo: `?search=texto`.

Implementar filtrado/búsqueda usando `django-filter` **o** sobreescribiendo `get_queryset()` con parámetros de query. Dado que el README dice "La elección de herramientas adicionales queda a criterio del postulante", ambas opciones son válidas. Sobreescribir `get_queryset()` es la opción más simple y sin dependencias extra.

### 2.4 URLs (`products/urls.py` y `backend/urls.py`) — [COMPLETADO]

**Requisito README:** "La organización de endpoints … queda a criterio del postulante"

- `products/urls.py` — usar `DefaultRouter` de DRF para registrar los ViewSets.
- `backend/urls.py` — incluir las URLs de products bajo el prefijo `/api/`.

Endpoints resultantes:
```
GET/POST       /api/products/
GET/PUT/PATCH/DELETE  /api/products/{id}/
GET/POST       /api/categories/
GET/PUT/PATCH/DELETE  /api/categories/{id}/
```

### 2.5 Migraciones — [COMPLETADO]

**Requisito README:** "Migraciones de base de datos"

- Ejecutar `python manage.py makemigrations` después de definir los modelos.
- Ejecutar `python manage.py migrate`.
- Incluir los archivos de migración en el repositorio.

### 2.6 Pruebas Automatizadas (`products/tests.py`) — [COMPLETADO]

**Requisito README:** "Al menos dos pruebas automatizadas: creación correcta de un producto y rechazo de datos inválidos."

#### Test 1: Creación correcta de un producto
- Crear una categoría.
- Hacer `POST /api/products/` con datos válidos (nombre, precio >= 0, stock >= 0, categoría existente).
- Verificar respuesta `201 Created`.
- Verificar que el producto existe en la base de datos con los datos enviados.

#### Test 2: Rechazo de datos inválidos
- Hacer `POST /api/products/` con datos inválidos (ej: precio negativo, stock negativo, categoría inexistente, nombre vacío).
- Verificar respuesta `400 Bad Request`.
- Verificar que el cuerpo de la respuesta contiene mensajes de error comprensibles.

Usar `rest_framework.test.APITestCase` y `APIClient`.

---

## 3. Frontend — React (Vite)

### 3.1 Funcionalidades requeridas

**Requisito README:** "La interfaz debe permitir, como mínimo: Visualizar el listado de productos. Crear un producto mediante un formulario. Filtrar o buscar productos."

#### 3.1.1 Listado de productos — [COMPLETADO]
- Componente que haga `GET /api/products/` y muestre los productos.
- Mostrar al menos: nombre, descripción, precio, stock, categoría, fecha de creación.

#### 3.1.2 Formulario de creación de producto — [COMPLETADO]
- Formulario con campos: nombre, descripción, precio, stock, categoría (selector).
- El selector de categoría debe cargar las categorías desde `GET /api/categories/`.
- Al enviar, hacer `POST /api/products/`.
- Mostrar errores de validación devueltos por la API.

#### 3.1.3 Filtro/búsqueda de productos — [COMPLETADO]
- Campo de búsqueda por nombre → enviar `?search=texto` a la API.
- Filtro por categoría → enviar `?category=ID` a la API.
- Al menos uno de estos dos. El README dice "Filtrar **o** buscar productos" (el "o" da flexibilidad, pero implementar ambos es simple y cubre mejor el requisito).

### 3.2 Estructura de componentes (sugerida)

```
src/
├── App.jsx               # Componente raíz, layout principal
├── main.jsx              # Entry point
├── api.js                # [POR CREAR] Funciones para comunicarse con la API (fetch/axios)
├── components/
│   ├── ProductList.jsx   # [POR CREAR] Listado de productos
│   ├── ProductForm.jsx   # [POR CREAR] Formulario de creación
│   └── ProductFilter.jsx # [POR CREAR] Barra de búsqueda/filtro
└── App.css               # Estilos
```

### 3.3 Comunicación con la API

- Usar `fetch` nativo o `axios` (el README no especifica, `fetch` es más simple y no requiere dependencia extra).
- Base URL: `http://localhost:8000/api/`.

### 3.4 Manejo de errores

**Requisito README:** "Los errores de validación deben devolver una respuesta HTTP apropiada y comprensible" → El frontend debe mostrar al usuario los errores devueltos por la API cuando falla la validación del formulario.

---

## 4. Validaciones — Resumen consolidado

| Regla (README)                                    | Dónde se implementa           |
|---------------------------------------------------|-------------------------------|
| Nombre de categoría único                         | Modelo (`unique=True`) + serializer |
| Nombre, precio, stock y categoría obligatorios    | Modelo + serializer (`required`) |
| Precio >= 0                                       | Serializer (`MinValueValidator`) |
| Stock entero >= 0                                 | Serializer (`MinValueValidator`) |
| Categoría asociada debe existir                   | Serializer (`PrimaryKeyRelatedField`) |
| Errores de validación HTTP apropiados             | DRF por defecto (400 con detalle) |

---

## 5. Entregables — Checklist

Según la sección "Entregables" del README:

- [x] API funcional (CRUD productos, CRUD categorías, filtro por categoría, búsqueda por nombre).
- [x] Interfaz web funcional (listado, formulario de creación, filtro/búsqueda).
- [x] Migraciones de base de datos incluidas en el repositorio.
- [x] Al menos dos pruebas automatizadas (creación correcta + rechazo de datos inválidos).
- [x] Instrucciones completas para ejecutar el proyecto (sección "Anotaciones del postulante" en README).

---

## 6. Instrucciones de ejecución (a completar en el README)

**Requisito README:** "Indica los comandos necesarios para instalar las dependencias, configurar la base de datos, ejecutar el backend, ejecutar la interfaz y correr las pruebas."

Al finalizar la implementación, completar la sección "Instrucciones de ejecución" del README con:

```bash
# Backend
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend
cd frontend
npm install
npm run dev

# Tests
cd backend
python manage.py test
```

---

## 7. Ambigüedades detectadas en el README

| Ambigüedad | Recomendación |
|---|---|
| **`on_delete` de la FK categoría en producto:** El README dice "La categoría asociada debe existir" pero no indica qué hacer si se borra una categoría con productos. | Usar `PROTECT` para evitar borrado accidental. |
| **`description` obligatoria o no:** El README lista `description` como campo del producto pero no la menciona en los campos obligatorios ("Nombre, precio, stock y categoría son obligatorios"). | Tratar `description` como campo opcional (`blank=True`). |
| **CRUD de categorías en la API:** El README solo pide explícitamente operaciones sobre productos, pero la creación de productos requiere que existan categorías. | Implementar CRUD de categorías como requisito implícito. |
| **Filtrar "o" buscar:** "Filtrar o buscar productos" — ¿se requieren ambos o solo uno? | Implementar ambos; el esfuerzo es marginal y cubre el espíritu del requisito. |
| **Editar y eliminar desde la interfaz:** El README dice que la interfaz debe permitir "como mínimo" listar, crear y filtrar/buscar. No menciona editar o eliminar desde el frontend. | Implementar solo lo mínimo pedido en la interfaz. Editar/eliminar quedan disponibles en la API. |

---

## 8. Lo que NO se debe implementar

El README dice explícitamente:

> "No se requiere autenticación, carrito de compras, órdenes, pagos ni despliegue."

- No agregar login/registro ni protección de endpoints.
- No agregar modelos de órdenes, carrito o pagos.
- No configurar despliegue (Docker, Nginx, etc.).

---

## 9. Criterios de verificación

Para cada requisito, el agente implementador puede verificar su cumplimiento así:

| Requisito | Cómo verificar |
|---|---|
| CRUD de productos vía API | `curl` o Postman: POST, GET, PUT, PATCH, DELETE sobre `/api/products/` |
| Filtro por categoría | `GET /api/products/?category=1` devuelve solo productos de esa categoría |
| Búsqueda por nombre | `GET /api/products/?search=texto` devuelve productos cuyo nombre contiene el texto |
| Validaciones de precio, stock, obligatorios | `POST /api/products/` con datos inválidos devuelve 400 con detalle |
| Categoría única | `POST /api/categories/` con nombre duplicado devuelve 400 |
| Interfaz — listado | Abrir el frontend y ver la lista de productos |
| Interfaz — formulario | Crear un producto desde el formulario y verificar que aparece en la lista |
| Interfaz — filtro/búsqueda | Usar el filtro/búsqueda y verificar que la lista se actualiza |
| Migraciones | Los archivos de migración existen en `products/migrations/` |
| Tests | `python manage.py test` pasa con al menos 2 tests |
| Instrucciones | Seguir las instrucciones del README y levantar el proyecto desde cero |
