import * as React from "react";
import { useState } from "react";

export default function JoinClass() {
  const [active, setActive] = useState(false);
  return (
    <div className="rounded border bg-white p-4">
      <h3 className="mb-2 font-semibold">Join Class</h3>
      <button 
        onClick={() => setActive(!active)}
        className={`rounded px-4 py-2 ${active ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}
      >
        {active ? 'Joined' : 'Join'}
      </button>
    </div>
  );
}
