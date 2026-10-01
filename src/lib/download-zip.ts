/** Builds a zip of the latest transformed version of every project file. */
export async function downloadProjectZip(opts: {
  projectName: string;
  files: {
    name: string;
    content?: string | null;
    redesigned_content: string | null;
    seo_content?: string | null;
  }[];
}): Promise<void> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  const ready = opts.files.filter((file) => file.seo_content || file.redesigned_content);
  if (ready.length === 0) throw new Error("Nothing transformed yet.");

  for (const file of ready) {
    zip.file(file.name, file.seo_content ?? file.redesigned_content ?? file.content ?? "");
  }

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${opts.projectName.replace(/[^a-z0-9-_]+/gi, "-")}-rezyn.zip`;
  a.click();
  URL.revokeObjectURL(url);
}
