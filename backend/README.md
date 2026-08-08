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

### Notificaciones push (recordatorios al celular, Pro/Premium)

```bash
npm install                    # ya trae web-push
npx web-push generate-vapid-keys
```

Te va a imprimir un `Public Key` y un `Private Key` — pegalos en `VAPID_PUBLIC_KEY` y `VAPID_PRIVATE_KEY`. Sin esto, el botón de activar notificaciones en la app va a avisar que "todavía no están configuradas" pero el resto de la app sigue funcionando normal.

El job que revisa y manda los recordatorios (mail + push) corre solo, cada 15 minutos, mientras el server esté arriba — no hace falta configurar nada aparte.

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

- Validación de body con `zod` o `joi` en vez de checks manuales (ahora hay `helmet`, `express-rate-limit` y `express-mongo-sanitize`, pero la validación de forma de los datos sigue siendo manual).
- Tests (Jest + supertest) sobre los controladores.
- Verificación de firma del webhook de Mercado Pago (por ahora confía en el `external_reference`, que alcanza para un MVP pero conviene reforzar antes de manejar dinero real).

