import React from 'react';
import { render } from '@testing-library/react';
import IconBase from '@/components/brand/IconBase';
import ReportArgLogo from '@/components/brand/ReportArgLogo';
import {
  PinReportArg,
  REAL_CATEGORIES,
  CategoryFallbackIcon,
  getCategoryIcon
} from '@/components/brand/icons';
import { TOKEN_ROLES } from '@/components/brand/brandTokens';

describe('Identidad Visual - Logo Aprobado (#005CE6), Categorías Reales & Fallback', () => {
  it('IconBase debe heredar currentColor del contenedor', () => {
    const { container } = render(
      <IconBase size={24} title="Test Accessibility">
        <circle cx="12" cy="12" r="10" />
      </IconBase>
    );

    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveClass('text-current');
    expect(svgElement).toHaveAttribute('role', 'img');
  });

  it('ReportArgLogo debe renderizar el isotipo oficial en azul de marca (#005CE6) en fondo claro', () => {
    const { container } = render(<ReportArgLogo size={32} />);
    expect(container.textContent).toContain('ReportARG');
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveClass('text-[#005CE6]');
  });

  it('REAL_CATEGORIES debe incluir exactamente 11 categorías provenientes del seed SQL de la DB', () => {
    expect(REAL_CATEGORIES.length).toBe(11);
    const codes = REAL_CATEGORIES.map((c) => c.code);
    expect(codes).toContain('LUZ');
    expect(codes).toContain('AGUA');
    expect(codes).toContain('SEG');
    expect(codes).toContain('TRANS');
    expect(codes).toContain('RES');
    expect(codes).toContain('OBR');
    expect(codes).toContain('ALUM');
    expect(codes).toContain('ESP');
    expect(codes).toContain('ALERT');
    expect(codes).toContain('INFO');
    expect(codes).toContain('SALUD');
  });

  it('getCategoryIcon debe devolver el icono correspondiente al código y CategoryFallbackIcon si es desconocido', () => {
    const luzIcon = getCategoryIcon('LUZ');
    expect(luzIcon).toBeDefined();

    const unknownIcon = getCategoryIcon('CODIGO_INEXISTENTE_NUEVO');
    expect(unknownIcon).toBe(CategoryFallbackIcon);
  });

  it('Tokens de diseño deben incluir roles formales de color', () => {
    expect(TOKEN_ROLES.length).toBeGreaterThan(0);
    const primaryAction = TOKEN_ROLES.find((r) => r.role.includes('Acción Principal'));
    expect(primaryAction).toBeDefined();
  });
});
