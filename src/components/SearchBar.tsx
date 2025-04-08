import { JSX } from "preact/jsx-runtime";
import { useEffect, useState, useCallback } from "preact/hooks";

export interface CustomEngine {
  id: string;
  name: string;
  placeholder: string;
  url: string;
}

// Define search placeholders as a constant to avoid recreation on each render
const SEARCH_PLACEHOLDERS: Record<string, string> = {
  searxng: "search SearXNG",
  youtube: "search YouTube",
  images: "search Images",
  lucky: "I'm Feeling Lucky",
};

export type SearchEngines = "searxng" | "youtube" | "images" | "lucky" | string;

interface SearchBarProps {
  search: SearchEngines;
  setIsSearchBarActive: (bool: boolean) => void;
}

export default function SearchBar({
  search,
  setIsSearchBarActive,
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [customEngines, setCustomEngines] = useState<CustomEngine[]>([]);

  // Load custom engines only once on component mount
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
        }
      }
    } catch (e) {
      console.error("Failed to parse custom search engines", e);
    }
  }, []);

  function handleSubmit(event: Event) {
    event.preventDefault();
    if (!searchQuery.trim()) return;

    const query = encodeURIComponent(searchQuery.trim());
    setSearchQuery("");

    // Handle built-in search engines
    switch (search) {
      case "searxng":
        window.location.href = `https://searx.tiekoetter.com/search?q=${query}`;
        break;
      case "youtube":
        window.location.href = `https://www.youtube.com/results?search_query=${query}`;
        break;
      case "images":
        window.location.href = `https://searx.tiekoetter.com/search?q=!goi+${query}`;
        break;
      case "lucky":
        window.location.href = `https://searx.tiekoetter.com/search?q=!!+${query}`;
        break;
      default:
        // Handle custom search engines
        const customEngine = customEngines.find(
          (engine) => engine.id === search
        );
        if (customEngine) {
          window.location.href = customEngine.url.replace("{query}", query);
        }
        break;
    }
  }

  function handleChange(event: JSX.TargetedEvent<HTMLInputElement, Event>) {
    setSearchQuery(event.currentTarget.value);
  }

  function getPlaceholder(): string {
    // For built-in engines
    if (search in SEARCH_PLACEHOLDERS) {
      return SEARCH_PLACEHOLDERS[search];
    }

    // For custom engines
    const customEngine = customEngines.find((engine) => engine.id === search);
    return customEngine?.placeholder || "search";
  }

  return (
    <form onSubmit={handleSubmit} class="mb-2">
      <input
        class="text-white relative z-1 outline-none bg-neutral-800 p-2 text-left font-bankGothic text-2xl font-medium w-full"
        placeholder={getPlaceholder()}
        onChange={handleChange}
        value={searchQuery}
        onFocus={() => setIsSearchBarActive(true)}
        onBlur={() => setIsSearchBarActive(false)}
        aria-label={`Search ${getPlaceholder()}`}
      />
    </form>
  );
}
