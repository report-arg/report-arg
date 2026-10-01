"use client";

import React from "react";
import ClaimFeedCard from "./ClaimFeedCard";
import CommunicationFeedCard from "./CommunicationFeedCard";

export default function FeedCard({ item, onEliminado, priorityImage }) {
  if (!item) return null;

  if (item.tipo === "comunicado") {
    return <CommunicationFeedCard item={item} onEliminado={onEliminado} priorityImage={priorityImage} />;
  }

  return <ClaimFeedCard item={item} priorityImage={priorityImage} />;
}
