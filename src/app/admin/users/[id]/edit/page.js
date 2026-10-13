"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import UserForm from "@/components/admin/UserForm";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";

export default function EditUserPage() {
  const { id } = useParams();
  const router = useRouter();

  return (
    <div className="w-full">
      <PageHeader
        title="Editar Usuario"
        description="Modificá el rol, estado y datos del usuario seleccionado."
        action={
          <Button
            onClick={() => router.push("/admin/users")}
            variant="outline"
            leftIcon={<ArrowLeft size={16} />}
          >
            Volver a usuarios
          </Button>
        }
      />

      <UserForm usuarioId={id} />
    </div>
  );
}