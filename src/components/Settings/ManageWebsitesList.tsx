import { Website, moveWebsiteUp, moveWebsiteDown } from "../../db";
import ButtonWebsiteManage from "./ButtonWebsiteManage";
import Button from "../Button";
import { playSound } from "../../utils/audioUtils";

interface ManageWebsitesListProps {
  sites: Website[];
  refreshDatabase: () => void;
}

export default function ManageWebsitesList({
  sites,
  refreshDatabase,
}: ManageWebsitesListProps) {
  async function handleMoveUp(websiteId: number) {
    const soundEnabled = localStorage.getItem("soundEnabled") !== "false";
    if (soundEnabled) playSound("enter");

    try {
      await moveWebsiteUp(websiteId);
      refreshDatabase();
    } catch (error) {
      console.error("Error moving website up:", error);
    }
  }

  async function handleMoveDown(websiteId: number) {
    const soundEnabled = localStorage.getItem("soundEnabled") !== "false";
    if (soundEnabled) playSound("enter");

    try {
      await moveWebsiteDown(websiteId);
      refreshDatabase();
    } catch (error) {
      console.error("Error moving website down:", error);
    }
  }

  return (
    <div class="grid gap-2">
      {sites.map((site, index) => (
        <div key={site.id} class="flex items-center gap-2">
          <div class="flex-grow">
            <ButtonWebsiteManage
              name={site.name}
              link={site.link}
              websiteId={site.id}
              refreshDatabase={refreshDatabase}
            />
          </div>
          <div class="flex gap-1">
            <Button
              click={() => handleMoveUp(site.id)}
              text="▲"
              className={`px-2 ${
                index === 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={index === 0}
              sound="enter"
            />
            <Button
              click={() => handleMoveDown(site.id)}
              text="▼"
              className={`px-2 ${
                index === sites.length - 1
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              disabled={index === sites.length - 1}
              sound="enter"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
