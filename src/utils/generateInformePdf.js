const COLORS = [[37, 99, 235], [20, 184, 166], [245, 158, 11], [139, 92, 246], [239, 68, 68], [100, 116, 139]];

function asText(value) {
  return value === null || value === undefined ? 'Sin datos' : String(value);
}

async function loadLogo() {
  try {
    const response = await fetch('/logo.png');
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function generateInformePdf({ informe, institucion }) {
  const { jsPDF } = await import('jspdf');
  const logo = await loadLogo();
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
    nextPage(25);
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 35, 66);
    doc.text(title, margin, y);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.35);
    doc.line(margin, y + 4, pageWidth - margin, y + 4);
    y += 14;
  };
  const rows = (items) => {
    items.forEach(([label, value]) => {
      nextPage(13);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, y, pageWidth - margin * 2, 10, 1.5, 1.5, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text(label, margin + 4, y + 6.4);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 35, 66);
      doc.text(asText(value), pageWidth - margin - 4, y + 6.4, { align: 'right' });
      y += 14;
    });
  };
  const distribution = (title, items) => {
    section(title);
    const max = Math.max(...items.map((item) => item.cantidad), 1);
    items.forEach((item, index) => {
      nextPage(21);
      const width = ((pageWidth - margin * 2 - 56) * item.cantidad) / max;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      doc.text(item.nombre, margin, y + 4);
      doc.setFillColor(226, 232, 240);
      doc.roundedRect(margin + 52, y, pageWidth - margin * 2 - 56, 7, 1.5, 1.5, 'F');
      doc.setFillColor(...COLORS[index % COLORS.length]);
      doc.roundedRect(margin + 52, y, Math.max(width, 2), 7, 1.5, 1.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text(String(item.cantidad), pageWidth - margin, y + 5, { align: 'right' });
      y += 14;
    });
  };

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, 42, 'F');
  doc.setTextColor(15, 35, 66);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Informe de gestión de reclamos', margin + 45, 17);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(institucion || 'Institución', margin + 45, 25);
  if (logo) {
    doc.addImage(logo, 'PNG', margin, 9, 38, 19);
  }
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.65);
  doc.line(margin, 35, pageWidth - margin, 35);
  y = 54;
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(10);
  doc.text(`Período analizado: ${informe.periodo.desde} al ${informe.periodo.hasta}`, margin, y);
  y += 15;

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
      const titleLines = doc.splitTextToSize(title, pageWidth - margin * 2);
      doc.text(titleLines, margin, y);
      y += titleLines.length * 4.5 + 2;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(71, 85, 105);
      doc.text(`${reclamo.categoriaNombre || 'Sin categoría'} - ${reclamo.estado} - ${reclamo.afectadosCount} afectados`, margin, y);
      y += 12;
    });
  }
  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page); doc.setFontSize(8); doc.setTextColor(100, 116, 139);
    doc.text(`ReportARG - Informe institucional - Página ${page} de ${pageCount}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
  }
  doc.save(`informe-gestion-${informe.periodo.desde}-${informe.periodo.hasta}.pdf`);
}
