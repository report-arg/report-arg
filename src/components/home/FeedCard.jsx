"use client";

import React from "react";
import ClaimFeedCard from "./ClaimFeedCard";
import CommunicationFeedCard from "./CommunicationFeedCard";

export default function FeedCard({ item, onEliminado }) {
  if (!item) return null;

  if (item.tipo === "comunicado") {
    return <CommunicationFeedCard item={item} onEliminado={onEliminado} />;
  }

  return <ClaimFeedCard item={item} />;
}
