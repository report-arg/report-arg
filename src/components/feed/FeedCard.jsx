"use client";

import React from "react";
import ReclamoFeedCard from "./ReclamoFeedCard";
import ComunicadoFeedCard from "./ComunicadoFeedCard";

export default function FeedCard({ item, onEliminado, priorityImage }) {
  if (!item) return null;

  if (item.tipo === "comunicado") {
    return <ComunicadoFeedCard item={item} onEliminado={onEliminado} priorityImage={priorityImage} />;
  }

  return <ReclamoFeedCard item={item} priorityImage={priorityImage} />;
}
