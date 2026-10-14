"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import CategoriesPanel from "@/components/admin/categories/CategoriesPanel";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";

export default function CategoriesPage() {
  const router = useRouter();

  return (
    <div className="w-full">
      <PageHeader
        title="Gestión de Categorías"
        description="Configurá las categorías disponibles para reclamos ciudadanos y comunicados institucionales."
        action={
          <Button
            onClick={() => router.push("/admin/categories/crear")}
            variant="primary"
            leftIcon={<Plus size={16} />}
          >
            Nueva categoría
          </Button>
        }
      />

      <CategoriesPanel />
    </div>
  );
}