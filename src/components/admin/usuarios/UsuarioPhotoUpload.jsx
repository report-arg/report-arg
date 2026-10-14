"use client";

import { useRef } from "react";
import { User, Camera, Loader2 } from "lucide-react";

export default function UsuarioPhotoUpload({
  preview = null,
  uploading = false,
  onFileSelect,
}) {
  const fileRef = useRef(null);

  return (
    <div className="relative group">
      <div
        onClick={() => !uploading && fileRef.current?.click()}
        className="w-20 h-20 rounded-full overflow-hidden bg-surface-subtle border-2 border-border-subtle flex items-center justify-center cursor-pointer hover:border-primary transition-all relative"
        title="Seleccionar foto de perfil"
      >
        {preview ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={preview}
            alt="Vista previa"
            className="w-full h-full object-cover"
          />
        ) : (
          <User size={32} className="text-text-muted" />
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 size={20} className="animate-spin text-white" />
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-primary text-white shadow-xs hover:bg-primary-hover transition-colors cursor-pointer"
        title="Cambiar imagen"
      >
        <Camera size={13} />
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileSelect}
      />
    </div>
  );
}
