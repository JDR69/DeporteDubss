import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Servicio para generar reportes en múltiples formatos
 */

// ============================================
// REPORTES DE BITÁCORA
// ============================================

export const generarReporteBitacoraPDF = (logs, filtros = {}) => {
    const doc = new jsPDF();
    
    // Encabezado
    doc.setFontSize(20);
    doc.setTextColor(30, 58, 138); // Azul oscuro
    doc.text('Reporte de Bitácora del Sistema', 14, 20);
    
    // Fecha de generación
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, 14, 28);
    
    // Filtros aplicados
    if (filtros.fecha || filtros.usuario || filtros.accion) {
        doc.setFontSize(11);
        doc.setTextColor(0);
        doc.text('Filtros aplicados:', 14, 36);
        let yPos = 42;
        if (filtros.fecha) {
            doc.setFontSize(9);
            doc.text(`• Fecha: ${filtros.fecha}`, 20, yPos);
            yPos += 5;
        }
        if (filtros.usuario) {
            doc.setFontSize(9);
            doc.text(`• Usuario: ${filtros.usuario}`, 20, yPos);
            yPos += 5;
        }
        if (filtros.accion) {
            doc.setFontSize(9);
            doc.text(`• Acción: ${filtros.accion}`, 20, yPos);
            yPos += 5;
        }
    }
    
    // Tabla de datos
    const tableData = logs.map(log => [
        log.id,
        `${log.usuario.nombre} ${log.usuario.apellido}`,
        log.usuario.correo,
        log.usuario.rol || 'N/A',
        log.accion,
        new Date(log.fecha).toLocaleString('es-ES'),
        log.detalle || 'N/A'
    ]);
    
    autoTable(doc, {
        head: [['ID', 'Usuario', 'Correo', 'Rol', 'Acción', 'Fecha', 'Detalle']],
        body: tableData,
        startY: filtros.fecha || filtros.usuario || filtros.accion ? 50 : 35,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [30, 58, 138], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        columnStyles: {
            0: { cellWidth: 15 },
            1: { cellWidth: 30 },
            2: { cellWidth: 40 },
            3: { cellWidth: 20 },
            4: { cellWidth: 25 },
            5: { cellWidth: 35 },
            6: { cellWidth: 'auto' }
        }
    });
    
    // Pie de página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            `Página ${i} de ${pageCount} | Total de registros: ${logs.length}`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
        );
    }
    
    doc.save(`bitacora_${new Date().getTime()}.pdf`);
};

export const generarReporteBitacoraExcel = (logs, filtros = {}) => {
    // Preparar datos
    const data = logs.map(log => ({
        'ID': log.id,
        'Usuario': `${log.usuario.nombre} ${log.usuario.apellido}`,
        'Correo': log.usuario.correo,
        'Rol': log.usuario.rol || 'N/A',
        'Acción': log.accion,
        'Fecha': new Date(log.fecha).toLocaleString('es-ES'),
        'Detalle': log.detalle || 'N/A'
    }));
    
    // Crear hoja de cálculo
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Ajustar ancho de columnas
    ws['!cols'] = [
        { wch: 8 },  // ID
        { wch: 25 }, // Usuario
        { wch: 30 }, // Correo
        { wch: 15 }, // Rol
        { wch: 20 }, // Acción
        { wch: 20 }, // Fecha
        { wch: 40 }  // Detalle
    ];
    
    // Crear libro
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bitácora');
    
    // Guardar archivo
    XLSX.writeFile(wb, `bitacora_${new Date().getTime()}.xlsx`);
};

export const generarReporteBitacoraJSON = (logs, filtros = {}) => {
    const reporte = {
        titulo: 'Reporte de Bitácora del Sistema',
        fechaGeneracion: new Date().toISOString(),
        filtrosAplicados: filtros,
        totalRegistros: logs.length,
        datos: logs.map(log => ({
            id: log.id,
            usuario: {
                nombre: `${log.usuario.nombre} ${log.usuario.apellido}`,
                correo: log.usuario.correo,
                rol: log.usuario.rol
            },
            accion: log.accion,
            fecha: log.fecha,
            detalle: log.detalle
        }))
    };
    
    const blob = new Blob([JSON.stringify(reporte, null, 2)], { type: 'application/json' });
    saveAs(blob, `bitacora_${new Date().getTime()}.json`);
};

// ============================================
// REPORTES DE HISTORIAL/TABLA DE POSICIONES
// ============================================

export const generarReporteHistorialPDF = (historiales, campeonato) => {
    const doc = new jsPDF();
    
    // Encabezado
    doc.setFontSize(20);
    doc.setTextColor(6, 95, 70); // Verde oscuro
    doc.text('Tabla de Posiciones', 14, 20);
    
    // Información del campeonato
    doc.setFontSize(14);
    doc.setTextColor(52, 211, 153); // Verde brillante
    doc.text(campeonato || 'Todos los Campeonatos', 14, 30);
    
    // Fecha de generación
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, 14, 38);
    
    // Tabla de datos
    const tableData = historiales.map((h, index) => [
        h.Posicion || (index + 1),
        h.EquipoNombre || 'N/A',
        h.CampeonatoNombre || 'N/A',
        h.PJ || 0,
        h.PG || 0,
        h.PE || 0,
        h.PP || 0,
        h.GF || 0,
        h.GC || 0,
        h.DG || 0,
        h.Puntos || 0
    ]);
    
    autoTable(doc, {
        head: [['Pos', 'Equipo', 'Campeonato', 'PJ', 'PG', 'PE', 'PP', 'GF', 'GC', 'DG', 'Pts']],
        body: tableData,
        startY: 45,
        styles: { fontSize: 9, cellPadding: 2 },
        headStyles: { fillColor: [6, 95, 70], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 253, 244] },
        columnStyles: {
            0: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
            1: { cellWidth: 40 },
            2: { cellWidth: 40 },
            3: { cellWidth: 12, halign: 'center' },
            4: { cellWidth: 12, halign: 'center' },
            5: { cellWidth: 12, halign: 'center' },
            6: { cellWidth: 12, halign: 'center' },
            7: { cellWidth: 12, halign: 'center' },
            8: { cellWidth: 12, halign: 'center' },
            9: { cellWidth: 12, halign: 'center' },
            10: { cellWidth: 15, halign: 'center', fontStyle: 'bold' }
        }
    });
    
    // Leyenda
    const finalY = doc.lastAutoTable.finalY || 45;
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text('PJ: Partidos Jugados | PG: Partidos Ganados | PE: Partidos Empatados | PP: Partidos Perdidos', 14, finalY + 10);
    doc.text('GF: Goles a Favor | GC: Goles en Contra | DG: Diferencia de Goles | Pts: Puntos', 14, finalY + 15);
    
    // Pie de página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            `Página ${i} de ${pageCount}`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
        );
    }
    
    doc.save(`tabla_posiciones_${new Date().getTime()}.pdf`);
};

export const generarReporteHistorialExcel = (historiales, campeonato) => {
    // Preparar datos
    const data = historiales.map((h, index) => ({
        'Posición': h.Posicion || (index + 1),
        'Equipo': h.EquipoNombre || 'N/A',
        'Campeonato': h.CampeonatoNombre || 'N/A',
        'PJ': h.PJ || 0,
        'PG': h.PG || 0,
        'PE': h.PE || 0,
        'PP': h.PP || 0,
        'GF': h.GF || 0,
        'GC': h.GC || 0,
        'DG': h.DG || 0,
        'Puntos': h.Puntos || 0
    }));
    
    // Crear hoja de cálculo
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Ajustar ancho de columnas
    ws['!cols'] = [
        { wch: 10 }, // Posición
        { wch: 30 }, // Equipo
        { wch: 30 }, // Campeonato
        { wch: 8 },  // PJ
        { wch: 8 },  // PG
        { wch: 8 },  // PE
        { wch: 8 },  // PP
        { wch: 8 },  // GF
        { wch: 8 },  // GC
        { wch: 8 },  // DG
        { wch: 10 }  // Puntos
    ];
    
    // Crear libro
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tabla de Posiciones');
    
    // Guardar archivo
    XLSX.writeFile(wb, `tabla_posiciones_${new Date().getTime()}.xlsx`);
};

export const generarReporteHistorialJSON = (historiales, campeonato) => {
    const reporte = {
        titulo: 'Tabla de Posiciones',
        campeonato: campeonato || 'Todos los Campeonatos',
        fechaGeneracion: new Date().toISOString(),
        totalEquipos: historiales.length,
        clasificacion: historiales.map((h, index) => ({
            posicion: h.Posicion || (index + 1),
            equipo: h.EquipoNombre,
            campeonato: h.CampeonatoNombre,
            estadisticas: {
                partidosJugados: h.PJ,
                partidosGanados: h.PG,
                partidosEmpatados: h.PE,
                partidosPerdidos: h.PP,
                golesAFavor: h.GF,
                golesEnContra: h.GC,
                diferenciaGoles: h.DG,
                puntos: h.Puntos
            }
        }))
    };
    
    const blob = new Blob([JSON.stringify(reporte, null, 2)], { type: 'application/json' });
    saveAs(blob, `tabla_posiciones_${new Date().getTime()}.json`);
};

// ============================================
// REPORTES DE CAMPEONATOS
// ============================================

export const generarReporteCampeonatosPDF = (campeonatos, deportes, categorias) => {
    const doc = new jsPDF();
    
    // Encabezado
    doc.setFontSize(20);
    doc.setTextColor(6, 95, 70);
    doc.text('Reporte de Campeonatos', 14, 20);
    
    // Fecha de generación
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, 14, 28);
    
    // Tabla de datos
    const tableData = campeonatos.map(camp => {
        const deporte = deportes.find(d => d.id === camp.IDDeporte);
        const categoria = categorias.find(c => c.id === camp.IDCategoria);
        return [
            camp.id,
            camp.Nombre,
            deporte?.Nombre || 'N/A',
            categoria?.Nombre || 'N/A',
            new Date(camp.Fecha_Inicio).toLocaleDateString('es-ES'),
            new Date(camp.Fecha_Fin).toLocaleDateString('es-ES'),
            camp.Estado
        ];
    });
    
    autoTable(doc, {
        head: [['ID', 'Nombre', 'Deporte', 'Categoría', 'Inicio', 'Fin', 'Estado']],
        body: tableData,
        startY: 35,
        styles: { fontSize: 9, cellPadding: 2 },
        headStyles: { fillColor: [6, 95, 70], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 253, 244] },
        columnStyles: {
            0: { cellWidth: 15 },
            1: { cellWidth: 50 },
            2: { cellWidth: 30 },
            3: { cellWidth: 25 },
            4: { cellWidth: 25 },
            5: { cellWidth: 25 },
            6: { cellWidth: 25 }
        }
    });
    
    // Pie de página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            `Página ${i} de ${pageCount} | Total: ${campeonatos.length} campeonatos`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
        );
    }
    
    doc.save(`campeonatos_${new Date().getTime()}.pdf`);
};

export const generarReporteCampeonatosExcel = (campeonatos, deportes, categorias) => {
    const data = campeonatos.map(camp => {
        const deporte = deportes.find(d => d.id === camp.IDDeporte);
        const categoria = categorias.find(c => c.id === camp.IDCategoria);
        return {
            'ID': camp.id,
            'Nombre': camp.Nombre,
            'Deporte': deporte?.Nombre || 'N/A',
            'Categoría': categoria?.Nombre || 'N/A',
            'Fecha Inicio': new Date(camp.Fecha_Inicio).toLocaleDateString('es-ES'),
            'Fecha Fin': new Date(camp.Fecha_Fin).toLocaleDateString('es-ES'),
            'Estado': camp.Estado
        };
    });
    
    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
        { wch: 8 },
        { wch: 40 },
        { wch: 20 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 }
    ];
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Campeonatos');
    XLSX.writeFile(wb, `campeonatos_${new Date().getTime()}.xlsx`);
};

export const generarReporteCampeonatosJSON = (campeonatos, deportes, categorias) => {
    const reporte = {
        titulo: 'Reporte de Campeonatos',
        fechaGeneracion: new Date().toISOString(),
        totalCampeonatos: campeonatos.length,
        campeonatos: campeonatos.map(camp => {
            const deporte = deportes.find(d => d.id === camp.IDDeporte);
            const categoria = categorias.find(c => c.id === camp.IDCategoria);
            return {
                id: camp.id,
                nombre: camp.Nombre,
                deporte: deporte?.Nombre,
                categoria: categoria?.Nombre,
                fechaInicio: camp.Fecha_Inicio,
                fechaFin: camp.Fecha_Fin,
                estado: camp.Estado
            };
        })
    };
    
    const blob = new Blob([JSON.stringify(reporte, null, 2)], { type: 'application/json' });
    saveAs(blob, `campeonatos_${new Date().getTime()}.json`);
};
