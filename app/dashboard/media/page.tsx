import MediaLibrary from "@/components/dashboard/media/MediaLibrary";
import { listAllMediaFilesAction, listMediaFoldersAction } from "@/lib/actions/media";

export const dynamic = "force-dynamic";

export const metadata = { title: "Media Library — Dashboard" };

export default async function MediaPage() {
  const files = await listAllMediaFilesAction();
  const folders = await listMediaFoldersAction();

  return <MediaLibrary initialFiles={files || []} initialFolders={folders || []} />;
}
