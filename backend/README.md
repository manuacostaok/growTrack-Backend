# GrowTrack Pro — API

Backend completo: autenticación (JWT), CRUD de cultivos y seguimiento diario, fotos (Cloudinary), pagos (Mercado Pago), analítica propia, calendario de eventos, base de conocimiento, panel admin y diagnóstico por IA (Gemini).

## Puesta en marcha

```bash
cd backend
cp .env.example .env      # completar MONGO_URI y los secretos JWT (y el resto según qué módulos uses)
npm install
npm run dev                # http://localhost:4000
```

### Cargar la base de conocimiento (una sola vez)

```bash
npm run seed:conocimiento
```

### Variables opcionales por módulo

- Fotos: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Pagos: `MERCADOPAGO_ACCESS_TOKEN`, `PRECIO_PRO`, `PRECIO_PREMIUM`, `API_PUBLIC_URL`
- IA: `GEMINI_API_KEY` (gratis en aistudio.google.com/apikey)

Si no completás alguna, esa función específica va a fallar al usarla, pero el resto de la API funciona igual.

### Crear un usuario admin

No hay endpoint para esto por seguridad: registrate normal desde `/register` y después cambiá el campo `rol` a `"admin"` directamente en MongoDB Atlas (Collections → users).

## Probar rápido

```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Test","email":"test@test.com","password":"12345678"}'

curl http://localhost:4000/api/v1/cultivos \
  -H "Authorization: Bearer TU_ACCESS_TOKEN"
```

## Qué falta para producción

- Rate limiting (`express-rate-limit`) en `/auth/login` para evitar fuerza bruta.
- Validación de body con `zod` o `joi` en vez de checks manuales.
- Tests (Jest + supertest) sobre los controladores.
- Verificación de firma del webhook de Mercado Pago (por ahora confía en el `external_reference`, que alcanza para un MVP pero conviene reforzar antes de manejar dinero real).

