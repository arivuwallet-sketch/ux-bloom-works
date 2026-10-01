/** Builds a zip of the latest transformed version of every available project file. */
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
  const hasTransformation = opts.files.some((file) => file.seo_content || file.redesigned_content);
  if (!hasTransformation) throw new Error("Nothing transformed yet.");

  let included = 0;
  for (const file of opts.files) {
    const content = file.seo_content ?? file.redesigned_content ?? file.content;
    if (content === null || content === undefined) continue;
    zip.file(file.name, content);
    included += 1;
  }
  if (included === 0) throw new Error("No exportable text files are available.");

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${opts.projectName.replace(/[^a-z0-9-_]+/gi, "-")}-rezyn.zip`;
  a.click();
  URL.revokeObjectURL(url);
}
