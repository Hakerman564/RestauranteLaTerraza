import { table } from "node:console";

async function runIntegrationTest() {
    const URL = `http://localhost:${process.env.PORT || 3000}`;
    console.log("--- Iniciando Pruebas de Integracion ---");

    console.log("- Test 1: Estado del entorno -");

    const health = await fetch(`${URL}/health`);
    console.log("Salud del servidor:", health.status === 200 ? "OK" : "Error");
    if (health.status !== 200) return;

    await fetch(`${URL}/seed`, { method: 'POST' });
    console.log("Carga de la Seed: OK\n");

    console.log("- Test 2: Reglas de Negocio y Límites -");

    const extraTable = await fetch(`${URL}/areas/VIP/tables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ capacity: 4, type: 'STANDARD' })
    });
    console.log("Prueba 1 (Límite VIP):",extraTable.status === 409 ? "BLOQUEADO: No permite superar el límite de 3" : "FALLO: Permitió exceder el límite");

    const res7p = await fetch(`${URL}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            partySize: 7,
            date: "2026-12-01",
            startTime: "19:00",
            duration: 90,
            areaId: "TERRACE"
        })
    });
    const data7p = await res7p.json();

    console.log("Prueba 2 (Redondeo):",data7p.tableId.includes("TERRACE") ? `ASIGNADO: Grupo de 7 en mesa ${data7p.tableId}` : "FALLO: No asignó mesa correcta");

    await fetch(`${URL}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            partySize: 7, date: "2026-12-01", startTime: "19:00", duration: 90, areaId: "TERRACE"
        })
    });

    const solape = await fetch(`${URL}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            partySize: 7,
            date: "2026-12-01",
            startTime: "19:30",
            duration: 90,
            areaId: "TERRACE"
        })
    });
    console.log("Prueba 3 (Anti - Solape):",solape.status === 409 ? "BLOQUEADO: Detectó solape de horario" : "FALLO: Permitió sobre-reserva");

    await fetch(`${URL}/reservations/${data7p.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' })
    });

    const reTry = await fetch(`${URL}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            partySize: 7,
            date: "2026-12-01",
            startTime: "19:00",
            duration: 90,
            areaId: "TERRACE"
        })
    });
    console.log("Prueba 4 (Cancelación y re-intento):",reTry.status === 201 ? "OK (Espacio liberado)" : "FALLO: No detectó la cancelación");

    const notValidDate = await fetch(`${URL}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            partySize: 2,
            date: "2020-01-01",
            startTime: "12:00",
            duration: 90,
            areaId: "BAR"
        })
    });
    console.log("Prueba 5 (Fecha en el pasado):",notValidDate.status === 422 ? "RECHAZADO: Fecha antigua no permitida" : "FALLO: Aceptó fecha en el pasado");

    const res = await fetch(`${URL}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            partySize: 2,
            date: "2026-12-01",
            startTime: "20:00",
            duration: 90,
            areaId: "TERRACE"
        })
    });
    console.log("Creación de reserva:", res.status === 201 ? "OK" : "Error");

    const areas = await fetch(`${URL}/areas`);
    console.log("Consulta de áreas:", areas.status === 200 ? "OK" : "Error");

    console.log("--- Pruebas Finalizadas ---");
}

runIntegrationTest();