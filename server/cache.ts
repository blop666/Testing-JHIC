import { revalidateTag } from "next/cache";

export function revalidatePublicResource(resource: "posts" | "guru" | "facilities" | "partners" | "settings" | "programs" | "vokasi", type?: string, key?: string) {
  if (resource === "posts") {
    revalidateTag("public-posts");
    if (type) revalidateTag(`public-posts-${type}`);
    return;
  }
  if (resource === "settings" && key) revalidateTag(`public-setting-${key}`);
  else if (resource === "programs") revalidateTag("public-programs");
  else if (resource === "vokasi") revalidateTag("public-vokasi");
  else {
    revalidateTag(`public-${resource}`);
    if (resource === "guru") revalidateTag("public-guru-categories");
  }
}
