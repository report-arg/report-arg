import { getCategoryIcon, CategoryFallbackIcon } from '@/components/brand/icons';
import { CLAIM_STATUSES, getEstadoConfig } from '@/utils/claimStatus';

describe('Admin - Categorías y Supervisión de Reclamos', () => {
  describe('Categorías', () => {
    it('debe asignar CategoryFallbackIcon a cualquier categoría sin icono específico', () => {
      const fallbackIcon = getCategoryIcon('NUEVA_CAT_TEST', 'Nueva Categoría Desconocida');
      expect(fallbackIcon).toBe(CategoryFallbackIcon);
    });

    it('debe resolver iconos oficiales para categorías del seed (ALUM, AGUA, RES, etc.)', () => {
      const alumIcon = getCategoryIcon('ALUM', 'Alumbrado Público');
      expect(alumIcon).toBeDefined();
      expect(alumIcon).not.toBe(CategoryFallbackIcon);

      const aguaIcon = getCategoryIcon('AGUA', 'Agua y Saneamiento');
      expect(aguaIcon).toBeDefined();
      expect(aguaIcon).not.toBe(CategoryFallbackIcon);
    });
  });

  describe('Supervisión de Reclamos', () => {
    it('debe contener los 5 estados canónicos de reclamos', () => {
      expect(CLAIM_STATUSES).toEqual([
        'Pendiente',
        'En revisión',
        'En proceso',
        'Resuelto',
        'Cancelado',
      ]);
    });

    it('cada estado debe tener su configuración visual y semántica', () => {
      CLAIM_STATUSES.forEach((estado) => {
        const config = getEstadoConfig(estado);
        expect(config).toBeDefined();
        expect(config.label).toBe(estado);
        expect(config.bg).toBeDefined();
        expect(config.text).toBeDefined();
      });
    });
  });
});
