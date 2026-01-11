import { createClient } from "@/lib/supabase/server";
import { getFolders } from "@/features/folders/actions";
import { buildFolderTree } from "@/features/folders/utils";
import { SidebarContent } from "./SidebarContent";

export async function Sidebar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const folders = await getFolders();
  const tree = buildFolderTree(folders);

  return (
    <div className="hidden md:flex h-full">
      <SidebarContent folderTree={tree} />
    </div>
  );
}
