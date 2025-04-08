import Dexie, { EntityTable } from "dexie";

const initWebsites = [
  { name: "YouTube", link: "https://www.youtube.com/" },
  { name: "Gmail", link: "https://mail.google.com/" },
  { name: "HiAnime", link: "https://hianime.to/home" },
];

interface Website {
  id: number;
  name: string;
  link: string;
}

const db = new Dexie("WebsitesDatabase") as Dexie & {
  websites: EntityTable<Website, "id">;
};

db.version(1).stores({ websites: "++id, name, link" });

export type { Website };
export { db };

export async function initDb() {
  try {
    await db.open();
    const count = await db.websites.count();
    if (count > 0) return;
    for (let website of initWebsites) {
      await db.websites.add(website);
    }
  } catch (error) {
    console.error(error);
  }
}

export async function getDbArray() {
  try {
    await db.open();
    const dbArray = await db.websites.toArray();
    return dbArray;
  } catch (error) {
    console.error(error);
  }
}

// Move a website up in the list (swap with the previous website)
export async function moveWebsiteUp(id: number) {
  try {
    // Get all websites
    const websites = await db.websites.toArray();

    // Find the index of the website to move
    const index = websites.findIndex((site) => site.id === id);
    if (index <= 0) return websites; // Already at the top or not found

    // Swap with the previous website
    const temp = websites[index];
    websites[index] = websites[index - 1];
    websites[index - 1] = temp;

    // Clear the database and reinsert all websites in the new order
    await db.websites.clear();
    for (const site of websites) {
      await db.websites.add({
        name: site.name,
        link: site.link,
      });
    }

    return await getDbArray();
  } catch (error) {
    console.error("Failed to move website up:", error);
    return null;
  }
}

// Move a website down in the list (swap with the next website)
export async function moveWebsiteDown(id: number) {
  try {
    // Get all websites
    const websites = await db.websites.toArray();

    // Find the index of the website to move
    const index = websites.findIndex((site) => site.id === id);
    if (index === -1 || index >= websites.length - 1) return websites; // At the bottom or not found

    // Swap with the next website
    const temp = websites[index];
    websites[index] = websites[index + 1];
    websites[index + 1] = temp;

    // Clear the database and reinsert all websites in the new order
    await db.websites.clear();
    for (const site of websites) {
      await db.websites.add({
        name: site.name,
        link: site.link,
      });
    }

    return await getDbArray();
  } catch (error) {
    console.error("Failed to move website down:", error);
    return null;
  }
}
