import { useEffect, useState, useCallback } from "preact/hooks";
import Button from "../Button";
import { CustomEngine, SearchEngines } from "../SearchBar";
import CustomSearchEngine from "./CustomSearchEngine";

interface ToggleSearchEnginesProps {
  searchEngines: SearchEngines[];
  setSearchEngines: (searchEngines: SearchEngines[]) => void;
}

// Define built-in engines as a constant to avoid recreation on each render
const BUILT_IN_ENGINES: SearchEngines[] = [
  "searxng",
  "youtube",
  "images",
  "lucky",
];

export default function ToggleSearchEngines({
  searchEngines,
  setSearchEngines,
}: ToggleSearchEnginesProps) {
  const [customEngines, setCustomEngines] = useState<CustomEngine[]>([]);
  const [showCustomForm, setShowCustomForm] = useState(false);

  // Load custom engines on component mount
  useEffect(() => {
    loadCustomEngines();
  }, []);

  const loadCustomEngines = useCallback(() => {
    try {
      const storedEngines = localStorage.getItem("customSearchEngines");
      if (storedEngines) {
        const parsedEngines = JSON.parse(storedEngines);
        if (Array.isArray(parsedEngines)) {
          setCustomEngines(parsedEngines);
        } else {
          console.error("Custom search engines data is not an array");
          // Initialize with empty array if data is invalid
          localStorage.setItem("customSearchEngines", JSON.stringify([]));
        }
      }
    } catch (e) {
      console.error("Failed to parse custom search engines", e);
      // Reset localStorage if parsing failed
      localStorage.setItem("customSearchEngines", JSON.stringify([]));
    }
  }, []);

  const saveSearchEngines = useCallback(
    (engines: SearchEngines[]) => {
      localStorage.setItem("searchEngines", JSON.stringify(engines));
      setSearchEngines(engines);
    },
    [setSearchEngines]
  );

  function handleToggle(engine: SearchEngines) {
    if (searchEngines.includes(engine)) {
      // Remove engine
      const updatedEngines = searchEngines.filter((item) => item !== engine);
      saveSearchEngines(updatedEngines);
    } else {
      // Add engine
      const updatedEngines = [...searchEngines, engine];
      saveSearchEngines(updatedEngines);
    }
  }

  // Move engine up in the order
  function moveEngineUp(engineId: SearchEngines) {
    const index = searchEngines.indexOf(engineId);
    if (index > 0) {
      const updatedEngines = [...searchEngines];
      // Swap the engine with the one above it
      [updatedEngines[index - 1], updatedEngines[index]] = [
        updatedEngines[index],
        updatedEngines[index - 1],
      ];
      saveSearchEngines(updatedEngines);
    }
  }

  // Move engine down in the order
  function moveEngineDown(engineId: SearchEngines) {
    const index = searchEngines.indexOf(engineId);
    if (index < searchEngines.length - 1) {
      const updatedEngines = [...searchEngines];
      // Swap the engine with the one below it
      [updatedEngines[index], updatedEngines[index + 1]] = [
        updatedEngines[index + 1],
        updatedEngines[index],
      ];
      saveSearchEngines(updatedEngines);
    }
  }

  function handleAddEngine(engine: CustomEngine) {
    const updatedEngines = [...customEngines, engine];
    setCustomEngines(updatedEngines);
    localStorage.setItem("customSearchEngines", JSON.stringify(updatedEngines));

    // Automatically enable the new engine
    if (!searchEngines.includes(engine.id)) {
      handleToggle(engine.id);
    }
    setShowCustomForm(false);
  }

  function handleEditEngine(engine: CustomEngine) {
    const updatedEngines = customEngines.map((e) =>
      e.id === engine.id ? engine : e
    );
    setCustomEngines(updatedEngines);
    localStorage.setItem("customSearchEngines", JSON.stringify(updatedEngines));
    setShowCustomForm(false);
  }

  function handleDeleteEngine(engineId: string) {
    // Remove from custom engines
    const updatedEngines = customEngines.filter((e) => e.id !== engineId);
    setCustomEngines(updatedEngines);
    localStorage.setItem("customSearchEngines", JSON.stringify(updatedEngines));

    // Also remove from active search engines if it's there
    if (searchEngines.includes(engineId)) {
      const updatedSearchEngines = searchEngines.filter((e) => e !== engineId);
      saveSearchEngines(updatedSearchEngines);
    }
  }

  // Get display name for an engine
  function getEngineName(engineId: SearchEngines): string {
    if (BUILT_IN_ENGINES.includes(engineId as SearchEngines)) {
      return engineId;
    }
    const customEngine = customEngines.find((e) => e.id === engineId);
    return customEngine?.name || engineId;
  }

  // Render a search engine item with up/down buttons
  function renderEngineItem(engineId: SearchEngines, index: number) {
    const isFirst = index === 0;
    const isLast = index === searchEngines.length - 1;

    return (
      <div key={engineId} className="flex items-center mb-2">
        {/* Engine name button - takes most space */}
        <Button
          click={() => handleToggle(engineId)}
          className="w-full mr-2"
          text={getEngineName(engineId)}
        />

        {/* Up/Down arrows */}
        <div className="flex mr-2">
          <Button
            click={() => moveEngineUp(engineId)}
            text="▲"
            className={`px-2 ${isFirst ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={isFirst}
          />
          <Button
            click={() => moveEngineDown(engineId)}
            text="▼"
            className={`px-2 ${isLast ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={isLast}
          />
        </div>

        {/* ON/OFF toggle */}
        <Button
          click={() => handleToggle(engineId)}
          text="OFF"
          className="bg-transparent hidden" // Hidden because the engine is already in the list
        />
      </div>
    );
  }

  // Render a search engine that isn't currently active
  function renderInactiveEngine(engineId: SearchEngines, name: string) {
    return (
      <div key={engineId} className="flex justify-between mb-2">
        <Button
          click={() => handleToggle(engineId)}
          className="w-full"
          text={name}
        />
        <Button
          click={() => handleToggle(engineId)}
          text="OFF"
          className="bg-transparent"
        />
      </div>
    );
  }

  // Get all engines that aren't currently active
  const inactiveBuiltInEngines = BUILT_IN_ENGINES.filter(
    (engine) => !searchEngines.includes(engine)
  );

  const inactiveCustomEngines = customEngines.filter(
    (engine) => !searchEngines.includes(engine.id)
  );

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-white text-xl mb-2">Active Search Engines</h2>
        {searchEngines.length === 0 ? (
          <p className="text-gray-400">No search engines activated.</p>
        ) : (
          searchEngines.map((engine, index) => renderEngineItem(engine, index))
        )}
      </div>

      {inactiveBuiltInEngines.length > 0 && (
        <div>
          <h2 className="text-white text-xl mb-2">Inactive Built-in Engines</h2>
          {inactiveBuiltInEngines.map((engine) =>
            renderInactiveEngine(engine, engine)
          )}
        </div>
      )}

      {inactiveCustomEngines.length > 0 && (
        <div>
          <h2 className="text-white text-xl mb-2">Inactive Custom Engines</h2>
          {inactiveCustomEngines.map((engine) =>
            renderInactiveEngine(engine.id, engine.name)
          )}
        </div>
      )}

      <div>
        <Button
          text={
            showCustomForm
              ? "Hide Custom Engine Form"
              : "Add Custom Search Engine"
          }
          click={() => setShowCustomForm(!showCustomForm)}
        />

        {showCustomForm && (
          <div className="mt-4">
            <CustomSearchEngine
              onAddEngine={handleAddEngine}
              onEditEngine={handleEditEngine}
              onDeleteEngine={handleDeleteEngine}
              customEngines={customEngines}
            />
          </div>
        )}
      </div>
    </div>
  );
}
