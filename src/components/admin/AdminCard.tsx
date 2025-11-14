"use client";

import React from "react";

export default function AdminCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      className="
        w-full rounded-xl p-6 shadow-md border
        bg-white border-gray-200
        transition-all duration-300

        /* Auto-style inner elements */
        [&>form>input]:admin-input
        [&>form>textarea]:admin-textarea
        [&>form>select]:admin-select

        [&>form>.btn-blue]:admin-button-blue
        [&>form>.btn-green]:admin-button-green
        [&>form>.btn-red]:admin-button-red
      "
    >
      {/* Title */}
      <h2
        className="
          text-lg font-semibold mb-4 pb-2 border-b
          text-blue-700 border-blue-300
        "
      >
        {icon && <span className="mr-2">{icon}</span>}
        {title}
      </h2>

      {children}
    </section>
  );
}
