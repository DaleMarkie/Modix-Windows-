import React, { useState, useEffect } from "react";

type ModInfo = {
  id: string; // Steam Workshop mod ID
  name: string; // Friendly mod name
  required: boolean; // Whether required or optional
};

type DockerContainer = {
  id: string;
  name: string;
  status: "running" | "stopped" | "paused";
  mods: ModInfo[];
};

const dummyContainers: DockerContainer[] = [
  {
    id: "1",
    name: "steam_mods_container_1",
    status: "running",
    mods: [
      { id: "123456789", name: "Awesome Mod", required: true },
      { id: "987654321", name: "Optional Mod", required: false },
    ],
  },
  {
    id: "2",
    name: "steam_mods_container_2",
    status: "paused",
    mods: [{ id: "222333444", name: "Critical Fix Mod", required: true }],
  },
  {
    id: "3",
    name: "steam_mods_container_3",
    status: "stopped",
    mods: [],
  },
];

const DependencyChecker = () => {
  const [containers, setContainers] = useState<DockerContainer[]>([]);

  useEffect(() => {
    // Fetch containers + mods from backend here in real app
    setContainers(dummyContainers);
  }, []);

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen max-w-4xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-6">Dependency Checker</h1>
      <p className="mb-4 text-gray-400">
        Below is a list of your Steam mods Docker containers, their status, and
        the required mods.
      </p>

      {containers.length === 0 ? (
        <p className="text-gray-500 italic">No containers available.</p>
      ) : (
        <ul className="space-y-6">
          {containers.map((c) => (
            <li
              key={c.id}
              className={`p-4 rounded-lg shadow-lg ${
                c.status === "running"
                  ? "bg-green-700"
                  : c.status === "paused"
                  ? "bg-yellow-600"
                  : "bg-red-600"
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium text-lg">{c.name}</span>
                <span className="italic">{c.status.toUpperCase()}</span>
              </div>

              {c.mods.length === 0 ? (
                <p className="text-gray-300 italic">
                  No mods required for this container.
                </p>
              ) : (
                <ul className="ml-4 list-disc list-inside">
                  {c.mods.map((mod) => (
                    <li key={mod.id} className="mb-1">
                      <a
                        href={`https://steamcommunity.com/sharedfiles/filedetails/?id=${mod.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`underline ${
                          mod.required ? "text-yellow-300" : "text-gray-400"
                        }`}
                      >
                        {mod.name}
                      </a>
                      {mod.required && (
                        <span className="ml-2 text-sm text-red-400">
                          (Required)
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DependencyChecker;
