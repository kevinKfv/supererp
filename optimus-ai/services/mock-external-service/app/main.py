import time
import asyncio
from fastapi import FastAPI, Request, Response, HTTPException
from fastapi.responses import PlainTextResponse

app = FastAPI(
    title="OptimusAI - External Systems Mock Service",
    description="Mock para servicios externos SOAP (WSDL/Envelope) y REST para pruebas de integración y resiliencia (Eje C).",
    version="1.0.0"
)

@app.get("/health")
def health():
    return {"status": "ok", "service": "mock-external-service"}

# ==============================================================================
# SOAP Endpoint (XML Envelope, Business Fault & Technical Fault)
# ==============================================================================
@app.post("/soap/partner-billing", response_class=PlainTextResponse)
async def soap_partner_billing(request: Request):
    body = (await request.body()).decode("utf-8", errors="ignore")

    # Escenario 1: Fault de Negocio
    if "BusinessFaultTrigger" in body or "CREDIT_LIMIT_EXCEEDED" in body:
        fault_xml = """<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
    <soapenv:Body>
        <soapenv:Fault>
            <faultcode>soapenv:Client.BusinessFault</faultcode>
            <faultstring>Limite de credito de facturacion excedido por politicas corporativas</faultstring>
            <detail>
                <ErrorCode>BIZ-4001</ErrorCode>
                <Reason>MaximumCreditExceeded</Reason>
            </detail>
        </soapenv:Fault>
    </soapenv:Body>
</soapenv:Envelope>"""
        return Response(content=fault_xml, status_code=500, media_type="text/xml")

    # Escenario 2: Fault Técnico
    if "TechnicalFaultTrigger" in body or "DATABASE_UNAVAILABLE" in body:
        fault_xml = """<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
    <soapenv:Body>
        <soapenv:Fault>
            <faultcode>soapenv:Server.TechnicalFault</faultcode>
            <faultstring>Error interno en base de datos de sistema contable legacy</faultstring>
            <detail>
                <ErrorCode>SYS-5002</ErrorCode>
                <DatabaseHost>legacy-db.internal</DatabaseHost>
            </detail>
        </soapenv:Fault>
    </soapenv:Body>
</soapenv:Envelope>"""
        return Response(content=fault_xml, status_code=500, media_type="text/xml")

    # Escenario 3: Respuesta Exitosa SOAP
    success_xml = """<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
    <soapenv:Body>
        <BillingResponse xmlns="http://partner.erp.org/billing">
            <TransactionId>TX-SOAP-992817</TransactionId>
            <Status>PROCESSED</Status>
            <Timestamp>2026-11-10T12:00:00Z</Timestamp>
            <Message>Factura externa procesada con exito</Message>
        </BillingResponse>
    </soapenv:Body>
</soapenv:Envelope>"""
    return Response(content=success_xml, status_code=200, media_type="text/xml")

# ==============================================================================
# REST External Service (Cotizaciones con soporte para timeout > 5s y errores)
# ==============================================================================
@app.get("/rest/external-quote")
async def rest_external_quote(delay: float = 0.0, error: int = 200):
    if delay > 0:
        await asyncio.sleep(delay)
    
    if error >= 400:
        raise HTTPException(status_code=error, detail="Error simulado en partner REST externo")

    return {
        "provider": "ExternalQuoteProvider-V2",
        "currency_pair": "USD/ARS",
        "rate": 1150.0,
        "valid_until": "2026-11-10T23:59:59Z",
        "status": "APPROVED"
    }
