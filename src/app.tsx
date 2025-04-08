import { useEffect, useState, useCallback } from "preact/hooks";
import LinkMenu from "./components/LinkMenu";
import { getDbArray, initDb, Website } from "./db";
import SettingsMenu from "./components/Settings/SettingsMenu";
import SearchBar, { SearchEngines } from "./components/SearchBar";

// Define constants
const DEFAULT_SEARCH_ENGINES: SearchEngines[] = ["searxng"];
const DEFAULT_BACKGROUND = "bg1";
const BUILT_IN_ENGINES = ["searxng", "youtube", "images", "lucky"];

export function App() {
  const [currentBackground, setCurrentBackground] = useState("");
  const [searchEngines, setSearchEngines] = useState<SearchEngines[]>([]);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [isSearchBarActive, setIsSearchBarActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState("");

  // Initialize app on component mount
  useEffect(() => {
    async function initializeApp() {
      setIsLoading(true);
      await Promise.all([
        loadBackground(),
        loadSearchEngines(),
        loadDatabaseWebsites(),
      ]);
      setIsLoading(false);
    }

    initializeApp();
  }, []);

  // Update time every second
  useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      setCurrentTime(`${hours}:${minutes}`);
    };

    // Update immediately and then every second
    updateCurrentTime();
    const intervalId = setInterval(updateCurrentTime, 1000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  const loadBackground = useCallback(() => {
    const currentLocalBackground = localStorage.getItem("background");
    if (currentLocalBackground) {
      setCurrentBackground(currentLocalBackground);
    } else {
      setCurrentBackground(DEFAULT_BACKGROUND);
      localStorage.setItem("background", DEFAULT_BACKGROUND);
    }
  }, []);

  const initializeCustomEngines = useCallback(() => {
    // Initialize custom engines storage if not present
    if (!localStorage.getItem("customSearchEngines")) {
      localStorage.setItem("customSearchEngines", JSON.stringify([]));
    }
  }, []);

  const getCustomEngineIds = useCallback((): string[] => {
    try {
      const storedEngines = localStorage.getItem("customSearchEngines");
      if (storedEngines) {
        const engines = JSON.parse(storedEngines);
        if (Array.isArray(engines)) {
          return engines.map((engine: any) => engine.id);
        }
      }
    } catch (e) {
      console.error("Failed to get custom engine IDs", e);
    }
    return [];
  }, []);

  const loadSearchEngines = useCallback(() => {
    // Ensure custom engines are initialized
    initializeCustomEngines();

    try {
      const localSearchEngines = localStorage.getItem("searchEngines");

      if (localSearchEngines) {
        const parsedEngines = JSON.parse(localSearchEngines);

        if (Array.isArray(parsedEngines)) {
          // Get built-in and custom engines for validation
          const customEngines = getCustomEngineIds();

          // Filter to only include valid engines (built-in or custom)
          const validEngines = parsedEngines.filter(
            (engine: string) =>
              BUILT_IN_ENGINES.includes(engine) ||
              customEngines.includes(engine)
          ) as SearchEngines[];

          // If no valid engines found, use default
          if (validEngines.length === 0) {
            setSearchEngines(DEFAULT_SEARCH_ENGINES);
            localStorage.setItem(
              "searchEngines",
              JSON.stringify(DEFAULT_SEARCH_ENGINES)
            );
          } else {
            // Use the engines in the order they were saved
            setSearchEngines(validEngines);
          }
          return;
        }
      }

      // If no valid localStorage entry or parsing fails, use default
      setSearchEngines(DEFAULT_SEARCH_ENGINES);
      localStorage.setItem(
        "searchEngines",
        JSON.stringify(DEFAULT_SEARCH_ENGINES)
      );
    } catch (e) {
      console.error("Failed to load search engines", e);
      setSearchEngines(DEFAULT_SEARCH_ENGINES);
      localStorage.setItem(
        "searchEngines",
        JSON.stringify(DEFAULT_SEARCH_ENGINES)
      );
    }
  }, [initializeCustomEngines, getCustomEngineIds]);

  const loadDatabaseWebsites = useCallback(async () => {
    try {
      await initDb();
      const dbArray = await getDbArray();
      if (dbArray) setWebsites(dbArray);
    } catch (e) {
      console.error("Failed to load websites from database", e);
    }
  }, []);

  function toggleSettings() {
    setShowSettings((s) => !s);
  }

  if (isLoading) {
    return (
      <div class="bg-black flex justify-center items-center min-h-screen w-full">
        <div class="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div class="bg-black flex justify-center items-center min-h-screen w-full">
      <div class="relative overflow-hidden w-full max-w-[1680px] min-h-screen">
        <main class="lg:px-28 px-8 select-none">
          <img
            src={`images/${currentBackground}.webp`}
            alt="background"
            class="right-0 absolute md:block hidden z-0"
          />

          {!showSettings ? (
            <div class="w-full lg:max-w-[40vw] lg:pt-[60px] pt-16 z-1 relative">
              {/* Header with Main Menu and Time */}
              <div class="mb-6">
                <h1 class="font-beckett text-[#9ec8ed] md:text-5xl text-4xl">
                  Main Menu {currentTime}
                </h1>
              </div>

              <div class="md:max-w-[450px]">
                {searchEngines.map((engine) => (
                  <SearchBar
                    key={engine}
                    search={engine}
                    setIsSearchBarActive={setIsSearchBarActive}
                  />
                ))}
              </div>
              <LinkMenu
                sites={websites}
                isSearchBarActive={isSearchBarActive}
                toggleSettings={toggleSettings}
              />
            </div>
          ) : (
            <div class="lg:max-w-[40vw] w-full lg:pt-[60px] pt-16">
              <SettingsMenu
                sites={websites}
                refreshDatabase={loadDatabaseWebsites}
                toggleSettings={toggleSettings}
                currentBackground={currentBackground}
                setCurrentBackground={setCurrentBackground}
                searchEngines={searchEngines}
                setSearchEngines={setSearchEngines}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
