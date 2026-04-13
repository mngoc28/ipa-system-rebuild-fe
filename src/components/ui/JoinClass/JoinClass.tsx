import * as React from "react";
import { useState } from "react";

export default function JoinClass() {
  const [active, setActive] = useState(false);
  return (
    <div className="p-4 border rounded bg-white">
      <h3 className="font-semibold mb-2">Join Class</h3>
      <button 
        onClick={() => setActive(!active)}
        className={`px-4 py-2 rounded ${active ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}
      >
        {active ? 'Joined' : 'Join'}
      </button>
    </div>
  );
}
