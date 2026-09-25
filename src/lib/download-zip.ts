/** Builds a zip of every redesigned file in a project and triggers a browser download. */
export async function downloadProjectZip(opts: {
  projectName: string;
  files: { name: string; redesigned_content: string | null }[];
}): Promise<void> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  const done = opts.files.filter((f) => f.redesigned_content);
  if (done.length === 0) throw new Error("Nothing redesigned yet.");
  for (const file of done) zip.file(file.name, file.redesigned_content ?? "");
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${opts.projectName.replace(/[^a-z0-9-_]+/gi, "-")}-redesigned.zip`;
  a.click();
  URL.revokeObjectURL(url);
}
