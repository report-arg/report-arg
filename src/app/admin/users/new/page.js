"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import UserForm from "@/components/admin/UserForm";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";

export default function NewUserPage() {
  const router = useRouter();

  return (
    <div className="w-full">
      <PageHeader
        title="Crear Usuario"
        description="Completá los datos para registrar un nuevo usuario en ReportARG."
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

      <UserForm />
    </div>
  );
}