# Approach Seleccionado: B - Auto-asignación

### Motivos de elegir autoasignacion
1. **Eficiencia Operativa:** El personal de WhatsApp no tiene que revisar un mapa de mesas. El sistema elige la mejor opción al instante.
2. **Optimización de Espacio:** La normalización de capacidad asegura que no se use una mesa de 8 para 2 personas si hay una de 2 disponible.
3. **Reducción de Conflictos VIP:** El sistema bloquea automáticamente las combinaciones A+B, algo que causa muchos errores en gestión manual.

### Trade-offs
- **Rigidez:** El sistema no permite (por ahora) mover una reserva de una mesa a otra manualmente si el gerente lo desea por una excepción.
- **Memoria Volátil:** Al no usar DB persistente (SQL/NoSQL), un reinicio del server limpia las reservas.

### Prioridad del Cliente
Se priorizó la **regla anti-sobre-reserva** y la **facilidad de uso** para el personal de redes sociales.