const COLORS = [[37, 99, 235], [20, 184, 166], [245, 158, 11], [139, 92, 246], [239, 68, 68], [100, 116, 139]];

function asText(value) {
  return value === null || value === undefined ? 'Sin datos' : String(value);
}

export async function generateInformePdf({ informe, institucion }) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  let y = 18;

  const nextPage = (space = 12) => {
    if (y + space <= pageHeight - 16) return;
    doc.addPage();
    y = 18;
  };
  const section = (title) => {
    nextPage(15);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 35, 66);
    doc.text(title, margin, y);
    y += 8;
  };
  const rows = (items) => {
    items.forEach(([label, value]) => {
      nextPage(8);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, y, pageWidth - margin * 2, 8, 1.5, 1.5, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text(label, margin + 3, y + 5.2);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 35, 66);
      doc.text(asText(value), pageWidth - margin - 3, y + 5.2, { align: 'right' });
      y += 10;
    });
  };
  const distribution = (title, items) => {
    section(title);
    const max = Math.max(...items.map((item) => item.cantidad), 1);
    items.forEach((item, index) => {
      nextPage(12);
      const width = ((pageWidth - margin * 2 - 56) * item.cantidad) / max;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      doc.text(item.nombre, margin, y + 3);
      doc.setFillColor(226, 232, 240);
      doc.roundedRect(margin + 52, y, pageWidth - margin * 2 - 56, 6, 1.5, 1.5, 'F');
      doc.setFillColor(...COLORS[index % COLORS.length]);
      doc.roundedRect(margin + 52, y, Math.max(width, 2), 6, 1.5, 1.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text(String(item.cantidad), pageWidth - margin, y + 4.2, { align: 'right' });
      y += 10;
    });
  };

  doc.setFillColor(30, 58, 100);
  doc.rect(0, 0, pageWidth, 34, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Informe de gestión de reclamos', margin, 17);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(institucion || 'Institución', margin, 25);
  y = 44;
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(10);
  doc.text(`Período analizado: ${informe.periodo.desde} al ${informe.periodo.hasta}`, margin, y);
  y += 10;

  section('Indicadores principales');
  rows([
    ['Reclamos recibidos', informe.kpis.recibidos],
    ['Reclamos resueltos', informe.kpis.resueltos],
    ['Porcentaje de resolución', informe.kpis.porcentajeResolucion === null ? null : `${Number(informe.kpis.porcentajeResolucion).toFixed(1)}%`],
    ['Tiempo promedio de resolución', informe.kpis.tiempoPromedioResolucionDias === null ? null : `${Number(informe.kpis.tiempoPromedioResolucionDias).toFixed(1)} días`],
    ['Reclamos demorados', informe.kpis.demorados],
  ]);
  distribution('Distribución por estado', informe.porEstado);
  distribution('Distribución por categoría', informe.porCategoria);
  section('Reclamos con mayor impacto ciudadano');
  if (!informe.mayorImpacto.length) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.text('No hay reclamos para mostrar en este período.', margin, y);
  } else {
    informe.mayorImpacto.forEach((reclamo, index) => {
      nextPage(15);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(15, 35, 66);
      const title = `${index + 1}. ${reclamo.titulo || 'Reclamo sin título'}`;
      doc.text(doc.splitTextToSize(title, pageWidth - margin * 2), margin, y);
      y += 5;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(71, 85, 105);
      doc.text(`${reclamo.categoriaNombre || 'Sin categoría'} - ${reclamo.estado} - ${reclamo.afectadosCount} afectados`, margin, y);
      y += 8;
    });
  }
  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page); doc.setFontSize(8); doc.setTextColor(100, 116, 139);
    doc.text(`ReportARG - Informe institucional - Página ${page} de ${pageCount}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
  }
  doc.save(`informe-gestion-${informe.periodo.desde}-${informe.periodo.hasta}.pdf`);
}
