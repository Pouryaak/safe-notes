import { Folder } from "@/types/database";

export interface FolderNode extends Folder {
  children: FolderNode[];
}

export function buildFolderTree(folders: Folder[]): FolderNode[] {
  const map: { [key: string]: FolderNode } = {};
  const roots: FolderNode[] = [];

  // Initialize map
  folders.forEach((folder) => {
    map[folder.id] = { ...folder, children: [] };
  });

  // Build tree
  folders.forEach((folder) => {
    if (folder.parent_id && map[folder.parent_id]) {
      map[folder.parent_id].children.push(map[folder.id]);
    } else {
      roots.push(map[folder.id]);
    }
  });

  return roots;
}
