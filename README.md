# Prueba técnica Junior Fullstack

Construye una aplicación sencilla para administrar un catálogo de productos. La
solución debe incluir una API REST en Django y una interfaz web que la consuma.

**Tiempo estimado de desarrollo:** 90 minutos.

Este tiempo es una referencia para dimensionar el alcance y no un límite de
ejecución. Se recomienda priorizar una solución simple, funcional y clara.

## Alcance

### API

La API debe permitir:

- Listar productos y consultar uno por su ID.
- Crear, editar y eliminar productos.
- Filtrar productos por categoría.
- Buscar productos por nombre.

Una **categoría** debe contener:
- nombre


Un **producto** debe contener:
- nombre
- descripción
- precio
- stock
- categoría
- fecha de creación

### Interfaz web

La interfaz debe permitir, como mínimo:

- Visualizar el listado de productos.
- Crear un producto mediante un formulario.
- Filtrar o buscar productos.

Puedes utilizar Next.js u otro framework basado en React. La elección queda a tu
criterio y debe ser adecuada al alcance de la solución.

## Reglas

- El backend debe utilizar Django y Django REST Framework.
- La base de datos debe ser SQLite.
- El nombre de cada categoría debe ser único.
- Nombre, precio, stock y categoría son obligatorios.
- El precio debe ser mayor o igual a cero.
- El stock debe ser un entero mayor o igual a cero.
- La categoría asociada debe existir.
- Los errores de validación deben devolver una respuesta HTTP apropiada y comprensible.

No se requiere autenticación, carrito de compras, órdenes, pagos ni despliegue.

## Entregables

- API e interfaz web funcionales.
- Migraciones de base de datos.
- Al menos dos pruebas automatizadas: creación correcta de un producto y rechazo
  de datos inválidos.
- Instrucciones completas para ejecutar el proyecto.

La organización de endpoints y la elección de herramientas adicionales quedan a
criterio del postulante.

## Uso de herramientas de IA

Puedes utilizar herramientas de IA como apoyo. Si lo haces, indícalo brevemente
en tus anotaciones junto con el propósito para el que las utilizaste. Debes
comprender todo el código presentado; estas herramientas no reemplazan el dominio
de la solución.

## Proceso de entrega

Realiza un fork de este repositorio y desarrolla allí tu solución. Al finalizar,
comparte el enlace público al fork según las instrucciones recibidas.

El plazo para enviar la solución es de **cinco días corridos** desde la recepción
de la prueba. Una vez vencido ese plazo, no se recibirán nuevas entregas.

## Criterios de evaluación

- Cumplimiento de los requisitos y funcionamiento de los endpoints.
- Uso adecuado de modelos, serializers y vistas.
- Integración entre la interfaz y la API.
- Elección de herramientas acorde con el alcance solicitado.
- Claridad, organización y comprensión del código.
- Calidad de las validaciones, pruebas y documentación.

---

## Anotaciones del postulante


### Instrucciones de ejecución

**Requisitos previos:** Python 3.10+, Node.js 18+, npm.

#### Backend (Django REST Framework)

```bash
cd backend
python -m venv venv
source venv/bin/activate   # En Windows: venv\Scripts\activate
```

> **Nota Windows:** Si aparece el error *"la ejecución de scripts está deshabilitada en este sistema"*, ejecuta primero en PowerShell como administrador:
> ```powershell
> Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

El backend queda disponible en `http://localhost:8000/api/`.

Para crear categorías iniciales de prueba:

```bash
cd backend
python manage.py shell -c "
from products.models import Category
Category.objects.get_or_create(name='Electrónica')
Category.objects.get_or_create(name='Hogar')
Category.objects.get_or_create(name='Oficina')
print('Categorías creadas')
"
```

#### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

El frontend queda disponible en `http://localhost:5173/`.

#### Pruebas automatizadas

```bash
cd backend
python manage.py test
```

### Decisiones y observaciones

- **Framework frontend:** Se eligió Vite + React (sin TypeScript) por ser la opción más simple y adecuada al alcance del challenge de 90 minutos.
- **Filtrado y búsqueda:** Se implementaron ambos (por categoría y por nombre) aunque el README indica "filtrar o buscar". El esfuerzo adicional fue mínimo y cubre mejor el requisito.
- **`on_delete=PROTECT` en la FK de categoría:** El README no especifica qué hacer al eliminar una categoría con productos asociados. Se optó por `PROTECT` para evitar borrado accidental de datos relacionados.
- **`description` como campo opcional:** El README no lo incluye en la lista de campos obligatorios ("Nombre, precio, stock y categoría son obligatorios"), por lo que se trató como `blank=True`.
- **CORS:** Se habilitó `CORS_ALLOW_ALL_ORIGINS = True` para permitir la comunicación entre el frontend (puerto 5173) y el backend (puerto 8000) en desarrollo.
- **Mensajes de validación en español:** Se personalizaron todos los mensajes de error de validación para que sean claros y en español.
- **Sin autenticación, carrito, órdenes, pagos ni despliegue**, conforme a lo indicado en el README.

### Herramientas de IA utilizadas

Se utilizó un asistente de IA (Antigravity / Claude) como apoyo para:
- Generar la estructura inicial del proyecto y el plan de implementación.
- Escribir modelos, serializers, vistas, tests y componentes React.
- Revisar validaciones y mensajes de error.

Todo el código fue revisado y comprendido antes de incorporarlo a la solución.
