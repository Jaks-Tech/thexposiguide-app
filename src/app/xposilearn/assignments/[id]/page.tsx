import { supabase } from "@/lib/supabaseClient";

export default async function AssignmentView({ params }: { params: { id: string } }) {
  const { data, error } = await supabase
    .from("assignments")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !data)
    return (
      <div className="p-10 text-center text-red-600">
        ❌ Assignment not found
      </div>
    );

  const fileUrl = data.file_url;
  const ext = fileUrl.split(".").pop()?.toLowerCase();

  const isImage = ["png", "jpg", "jpeg", "gif", "webp"].includes(ext!);
  const isPDF = ext === "pdf";
  const isMarkdown = ext === "md";
  const isDoc = ["docx", "pptx", "xlsx"].includes(ext!);

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-blue-700 text-center">{data.title}</h1>
      <p className="text-gray-600 text-center">{data.description}</p>

      <div className="border rounded-xl shadow-sm p-4 bg-white">
        {isImage && (
          <img src={fileUrl} alt={data.title} className="mx-auto max-h-[80vh] object-contain" />
        )}
        {isPDF && (
          <iframe src={fileUrl} className="w-full h-[80vh] rounded-md border" />
        )}
        {isMarkdown && (
          <iframe src={fileUrl} className="w-full h-[80vh] rounded-md border bg-gray-50" />
        )}
        {isDoc && (
          <iframe
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`}
            className="w-full h-[80vh] rounded-md border"
          />
        )}
        {!isImage && !isPDF && !isMarkdown && !isDoc && (
          <p className="text-center text-gray-500 py-10">
            Preview not supported for this file type. Please download below.
          </p>
        )}
      </div>

      <div className="text-center">
        <a
          href={fileUrl}
          download
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700"
        >
          ⬇️ Download File
        </a>
      </div>
    </main>
  );
}
