"use client";

import { Printer } from "lucide-react";

export default function PrintButton({ label = "Print" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="btn btn-primary print:hidden"
    >
      <Printer size={16} aria-hidden="true" /> {label}
    </button>
  );
}
