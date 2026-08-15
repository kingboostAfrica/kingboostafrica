// Cloudinary unsigned upload helper (client-side)
// Requires two env vars:
//   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
//   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET  (an UNSIGNED preset created in Cloudinary settings)
//
// This mirrors the pattern used on NaijaToday: no server round-trip needed
// for the upload itself, we just get back a secure_url to store in Supabase.

export async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary env vars missing. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET."
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    throw new Error("Image upload failed. Please try again.");
  }

  const data = await res.json();
  return data.secure_url as string;
}

export async function uploadMultipleToCloudinary(
  files: File[]
): Promise<string[]> {
  return Promise.all(files.map(uploadToCloudinary));
}
