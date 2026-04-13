<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>{{ strtoupper($factura->tipo) }} #{{ $factura->numero }}</title>
    <style>
        @page { margin: 1cm; }
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 11px; color: #333; line-height: 1.4; }
        .page { width: 100%; }
        
        table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
        th, td { padding: 6px; text-align: left; vertical-align: top; }
        
        /* SII Box */
        .sii-box {
            border: 2px solid #dc2626;
            padding: 15px;
            text-align: center;
            width: 250px;
            float: right;
            margin-bottom: 20px;
        }
        .sii-box h2 { color: #dc2626; margin: 0; font-size: 16px; text-transform: uppercase; }
        .sii-box .doc-type { font-size: 18px; font-weight: bold; margin: 10px 0; border-top: 1px solid #dc2626; border-bottom: 1px solid #dc2626; padding: 5px 0; }
        .sii-box .numero { font-size: 20px; font-weight: bold; margin: 0; }
        
        /* Issuer Info */
        .issuer-info { width: 60%; float: left; margin-bottom: 20px; }
        .issuer-name { font-size: 18px; font-weight: bold; color: #1e3a8a; margin: 0 0 5px 0; text-transform: uppercase; }
        .issuer-giro { font-size: 11px; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; color: #4b5563; }
        .issuer-details { font-size: 10px; color: #4b5563; }
        
        /* Separator */
        .clearfix { clear: both; }
        
        /* Client Info Section */
        .section-header { background-color: #f3f4f6; font-weight: bold; padding: 5px 10px; border: 1px solid #d1d5db; margin-bottom: 10px; text-transform: uppercase; font-size: 10px; }
        .client-info-table td { border: 1px solid #d1d5db; padding: 5px 8px; font-size: 10px; }
        .client-info-table .label { font-weight: bold; width: 15%; background-color: #f9fafb; }
        
        /* Items Table */
        .items-table th { background-color: #1e3a8a; color: white; border: 1px solid #1e3a8a; text-transform: uppercase; font-size: 9px; padding: 8px; }
        .items-table td { border: 1px solid #d1d5db; padding: 8px; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        
        /* Summary Section */
        .summary-container { width: 300px; float: right; }
        .summary-table td { padding: 4px 8px; border: 1px solid #d1d5db; }
        .summary-table .label { font-weight: bold; background-color: #f9fafb; text-align: right; width: 60%; }
        .summary-table .value { text-align: right; font-weight: bold; }
        .summary-table .total-row { background-color: #f3f4f6; font-size: 13px; }
        
        /* Footer */
        .footer { margin-top: 50px; font-size: 9px; color: #6b7280; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 10px; }
        .legal-footer { font-weight: bold; color: #333; margin-top: 10px; font-size: 8px; }
        
        /* Notes */
        .notes-section { margin-top: 20px; font-size: 10px; border: 1px solid #d1d5db; padding: 10px; min-height: 50px; background-color: #fff; }
        .notes-title { font-weight: bold; margin-bottom: 5px; text-decoration: underline; }
    </style>
</head>
<body>
    <div class="page">
        <!-- SII Header Box and Issuer Info -->
        <div class="sii-box">
            <h2>R.U.T.: {{ $factura->emisor->rut ?? 'N/A' }}</h2>
            <div class="doc-type">
                @if($factura->tipo === 'venta')
                    FACTURA
                @elseif($factura->tipo === 'compra')
                    FACTURA DE COMPRA
                @else
                    {{ strtoupper($factura->tipo) }}
                @endif
            </div>
            <div class="numero">Nº {{ $factura->numero }}</div>
            <div style="font-size: 10px; margin-top: 10px; font-weight: bold; color: #dc2626;">S.I.I. - SANTIAGO</div>
        </div>

        <div class="issuer-info">
            <h1 class="issuer-name">{{ $factura->emisor->razon_social ?? $factura->emisor->name }}</h1>
            <div class="issuer-giro">{{ $factura->emisor->giro ?? 'GIRO COMERCIAL' }}</div>
            <div class="issuer-details">
                {{ $factura->emisor->direccion ?? 'DIRECCIÓN NO DISPONIBLE' }}<br>
                {{ $factura->emisor->comuna ?? '' }}{{ $factura->emisor->ciudad ? ', '.$factura->emisor->ciudad : '' }}<br>
                Teléfono: {{ $factura->emisor->telefono ?? 'S/N' }}<br>
                Email: {{ $factura->emisor->email }}
            </div>
        </div>

        <div class="clearfix"></div>

        <div style="margin-bottom: 20px;">
            <table style="width: 100%; border: none; margin-bottom: 0;">
                <tr>
                    <td style="padding-left: 0; font-size: 12px;">
                        <strong>SANTIAGO,</strong> {{ $factura->fecha ? $factura->fecha->format('d \d\e F \d\e Y') : now()->format('d \d\e F \d\e Y') }}
                    </td>
                </tr>
            </table>
        </div>

        <!-- Client Info -->
        <div class="section-header">Información del Receptor</div>
        <table class="client-info-table">
            <tr>
                <td class="label">Señor(es)</td>
                <td style="width: 45%;">{{ $factura->cliente->nombre ?? 'N/A' }}</td>
                <td class="label">R.U.T.</td>
                <td>{{ $factura->cliente->rut ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td class="label">Giro</td>
                <td colspan="3">{{ $factura->cliente->giro ?? 'PARTICULAR' }}</td>
            </tr>
            <tr>
                <td class="label">Dirección</td>
                <td>{{ $factura->cliente->direccion ?? 'S/D' }}</td>
                <td class="label">Comuna</td>
                <td>{{ $factura->cliente->comuna ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td class="label">Ciudad</td>
                <td>{{ $factura->cliente->ciudad ?? 'N/A' }}</td>
                <td class="label">Teléfono</td>
                <td>{{ $factura->cliente->telefono ?? 'S/N' }}</td>
            </tr>
        </table>

        <!-- Items Table -->
        <table class="items-table">
            <thead>
                <tr>
                    <th class="text-center" style="width: 10%;">Cant.</th>
                    <th style="width: 60%;">Descripción</th>
                    <th class="text-right" style="width: 15%;">P. Unitario</th>
                    <th class="text-right" style="width: 15%;">Total</th>
                </tr>
            </thead>
            <tbody>
                @php
                    $detalles = $factura->detalles ?? [];
                @endphp
                @foreach($detalles as $detalle)
                    <tr>
                        <td class="text-center">{{ number_format($detalle->cantidad, 0, ',', '.') }}</td>
                        <td>{{ $detalle->producto->nombre ?? 'Producto' }}</td>
                        <td class="text-right">${{ number_format($detalle->precio_unitario, 0, ',', '.') }}</td>
                        <td class="text-right">${{ number_format($detalle->total, 0, ',', '.') }}</td>
                    </tr>
                @endforeach
                
                {{-- Espacios en blanco para completar la tabla --}}
                @for($i = 0; $i < max(0, 8 - count($detalles)); $i++)
                    <tr>
                        <td style="color: transparent;">.</td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                @endfor
            </tbody>
        </table>

        <!-- Summary -->
        <div class="summary-container">
            <table class="summary-table">
                <tr>
                    <td class="label">Sub Total (Neto)</td>
                    <td class="value">${{ number_format($factura->subtotal, 0, ',', '.') }}</td>
                </tr>
                @if($factura->total_descuento > 0)
                <tr>
                    <td class="label">Descuento ({{ number_format($factura->descuento_valor, 0) }}{{ $factura->descuento_tipo === 'porcentaje' ? '%' : '' }})</td>
                    <td class="value">-${{ number_format($factura->total_descuento, 0, ',', '.') }}</td>
                </tr>
                @endif
                <tr>
                    <td class="label">IVA ({{ number_format($factura->iva_porcentaje ?? 19, 0) }}%)</td>
                    <td class="value">${{ number_format($factura->impuesto, 0, ',', '.') }}</td>
                </tr>
                <tr class="total-row">
                    <td class="label">TOTAL</td>
                    <td class="value" style="color: #1e3a8a;">${{ number_format($factura->total, 0, ',', '.') }}</td>
                </tr>
            </table>
        </div>

        <div class="clearfix"></div>

        <!-- Notes and Conditions -->
        @if($factura->notas)
            <div class="notes-section">
                <div class="notes-title">Observaciones / Condiciones de Pago:</div>
                <div style="margin-bottom: 10px;">{!! nl2br(e($factura->notas)) !!}</div>
            </div>
        @endif

        @if($factura->fecha_vencimiento)
            <div style="margin-top: 10px; font-weight: bold; font-size: 10px;">
                Fecha de Vencimiento: {{ $factura->fecha_vencimiento->format('d/m/Y') }}
            </div>
        @endif

        <!-- Footer -->
        <div class="footer">
            <div>Gracias por su preferencia.</div>
            <div class="legal-footer">Documento Tributario Electrónico según Art. 1° D.L. 3505 y Res. Ex. SII N° 48/2016</div>
            <div style="margin-top: 10px;">Generado por {{ $factura->emisor->name }} el {{ now()->format('d/m/Y H:i') }}</div>
        </div>
    </div>
</body>
</html>