import { getFolders } from "@/features/folders/actions";
import { buildFolderTree } from "@/features/folders/utils";
import { SidebarContent } from "./SidebarContent";

export async function Sidebar() {
  const folders = await getFolders();
  const tree = buildFolderTree(folders);

  return (
    <div className="hidden md:flex h-full">
      <SidebarContent folderTree={tree} />
    </div>
  );
}
