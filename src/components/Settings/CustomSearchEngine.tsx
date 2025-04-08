import { JSX } from "preact/jsx-runtime";
import { useState, useEffect } from "preact/hooks";
import Button from "../Button";
import { CustomEngine } from "../SearchBar";

interface CustomSearchEngineProps {
  onAddEngine: (engine: CustomEngine) => void;
  onEditEngine: (engine: CustomEngine) => void;
  onDeleteEngine: (engineId: string) => void;
  customEngines: CustomEngine[];
}

export default function CustomSearchEngine({
  onAddEngine,
  onEditEngine,
  onDeleteEngine,
  customEngines,
}: CustomSearchEngineProps) {
  const [name, setName] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [url, setUrl] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<{
    name?: string;
    placeholder?: string;
    url?: string;
  }>({});

  // Reset errors when form input changes
  useEffect(() => {
    setErrors({});
  }, [name, placeholder, url]);

  function generateId(name: string): string {
    return (
      name.toLowerCase().replace(/\s+/g, "-") +
      "-" +
      Date.now().toString().slice(-4)
    );
  }

  function validateForm(): boolean {
    const newErrors: {
      name?: string;
      placeholder?: string;
      url?: string;
    } = {};

    if (!name.trim()) {
      newErrors.name = "Engine name is required";
    }

    if (!placeholder.trim()) {
      newErrors.placeholder = "Placeholder text is required";
    }

    if (!url.trim()) {
      newErrors.url = "URL is required";
    } else if (!url.includes("{query}")) {
      newErrors.url = "URL must include {query} placeholder";
    } else if (!/^https?:\/\//.test(url)) {
      newErrors.url = "URL must start with http:// or https://";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: JSX.TargetedEvent<HTMLFormElement, Event>) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (editingId) {
      // Edit existing engine
      onEditEngine({
        id: editingId,
        name: name.trim(),
        placeholder: placeholder.trim(),
        url: url.trim(),
      });
    } else {
      // Add new engine
      onAddEngine({
        id: generateId(name),
        name: name.trim(),
        placeholder: placeholder.trim(),
        url: url.trim(),
      });
    }

    // Reset form
    resetForm();
  }

  function resetForm() {
    setName("");
    setPlaceholder("");
    setUrl("");
    setEditingId(null);
    setErrors({});
  }

  function handleEdit(engine: CustomEngine) {
    setName(engine.name);
    setPlaceholder(engine.placeholder);
    setUrl(engine.url);
    setEditingId(engine.id);
  }

  return (
    <div class="grid gap-4">
      <form onSubmit={handleSubmit} class="grid gap-2">
        <div>
          <input
            type="text"
            placeholder="Engine Name (e.g. Bing)"
            class={`bg-neutral-800 p-2 text-white w-full ${
              errors.name ? "border border-red-500" : ""
            }`}
            value={name}
            onChange={(e) => setName((e.target as HTMLInputElement).value)}
          />
          {errors.name && (
            <p class="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <input
            type="text"
            placeholder="Placeholder Text (e.g. search Bing)"
            class={`bg-neutral-800 p-2 text-white w-full ${
              errors.placeholder ? "border border-red-500" : ""
            }`}
            value={placeholder}
            onChange={(e) =>
              setPlaceholder((e.target as HTMLInputElement).value)
            }
          />
          {errors.placeholder && (
            <p class="text-red-500 text-sm mt-1">{errors.placeholder}</p>
          )}
        </div>

        <div>
          <input
            type="text"
            placeholder="URL with {query} (e.g. https://bing.com/search?q={query})"
            class={`bg-neutral-800 p-2 text-white w-full ${
              errors.url ? "border border-red-500" : ""
            }`}
            value={url}
            onChange={(e) => setUrl((e.target as HTMLInputElement).value)}
          />
          {errors.url && <p class="text-red-500 text-sm mt-1">{errors.url}</p>}
        </div>

        <Button
          text={editingId ? "Update Engine" : "Add Engine"}
          type="submit"
        />
        {editingId && <Button text="Cancel" click={resetForm} />}
      </form>

      <div class="mt-4">
        <h2 class="text-white text-xl mb-2">Custom Engines</h2>
        {customEngines.length === 0 ? (
          <p class="text-gray-400">No custom engines added yet.</p>
        ) : (
          <div class="grid gap-2">
            {customEngines.map((engine) => (
              <div
                key={engine.id}
                class="flex justify-between items-center bg-neutral-900 p-2"
              >
                <div>
                  <div class="text-white">{engine.name}</div>
                  <div class="text-gray-400 text-sm">{engine.url}</div>
                </div>
                <div class="flex gap-2">
                  <Button text="Edit" click={() => handleEdit(engine)} />
                  <Button
                    text="Delete"
                    click={() => onDeleteEngine(engine.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
