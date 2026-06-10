"use client";

import { useState } from "react";
import { EditCharactersModal } from "./EditCharactersModal";

export function EditCharactersButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Edit Characters
      </button>

      {open && <EditCharactersModal onClose={() => setOpen(false)} />}
    </>
  );
}
