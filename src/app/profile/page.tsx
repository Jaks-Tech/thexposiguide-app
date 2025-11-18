"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [profilePicUrl, setProfilePicUrl] = useState("");

  // ----------------------------------------
  // 1️⃣ Load Auth User + Profile Data
  // ----------------------------------------
  useEffect(() => {
    const loadProfile = async () => {
      const { data: authData } = await supabase.auth.getUser();

      if (!authData.user) {
        router.push("/auth/login");
        return;
      }

      setUser(authData.user);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      if (profileData) {
        setFullName(profileData.full_name || "");
        setYearOfStudy(profileData.year_of_study || "");
        setProfilePicUrl(profileData.profile_pic_url || "");
      }

      setLoading(false);
    };

    loadProfile();
  }, [router]);

  // ----------------------------------------
  // 2️⃣ Upload Profile Picture
  // ----------------------------------------
  const uploadProfilePic = async (event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const ext = file.name.split(".").pop();
    const fileName = `${user.id}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("profile-pictures")
      .upload(fileName, file);

    if (uploadError) {
      alert(uploadError.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = await supabase.storage
      .from("profile-pictures")
      .getPublicUrl(fileName);

    setProfilePicUrl(urlData.publicUrl);
    setUploading(false);
  };

  // ----------------------------------------
  // 3️⃣ Save Profile → Exit to Homepage
  // ----------------------------------------
  const saveProfile = async () => {
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        year_of_study: yearOfStudy,
        profile_pic_url: profilePicUrl,
      })
      .eq("id", user.id);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/"); // exit to homepage
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <p className="text-lg text-slate-600 animate-pulse">Loading profile...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 relative flex items-center justify-center px-6">

      {/* ❌ SAVE & EXIT BUTTON */}
      <button
        onClick={saveProfile}
        className="
          absolute top-4 right-4
          px-4 py-2 rounded-full 
          bg-blue-600 hover:bg-blue-700 text-white 
          shadow-md border border-blue-700
          text-sm font-semibold transition
        "
      >
        {saving ? "Saving..." : "Save & Exit"}
      </button>

      {/* CARD */}
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-10 sm:p-12">

        {/* LOGO */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/assets/logo.png"
            alt="The XPosiGuide"
            width={64}
            height={64}
            className="rounded-full shadow-md mb-3"
          />

          <h1 className="text-3xl font-bold text-slate-800">
            Your Profile
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Update your information below.
          </p>
        </div>

        {/* PROFILE PIC */}
        <div className="flex flex-col items-center gap-4 mb-8">

          <Image
            src={profilePicUrl || "/assets/placeholder-profile.png"}
            alt="Profile Picture"
            width={130}
            height={130}
            className="rounded-full object-cover border-4 border-blue-300 shadow-md bg-slate-200"
          />

          <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm shadow-md">
            {uploading ? "Uploading..." : "Upload Profile Picture"}
            <input
              type="file"
              accept="image/*"
              onChange={uploadProfilePic}
              className="hidden"
            />
          </label>
        </div>

        {/* FORM FIELDS */}
        <div className="space-y-6">

          {/* FULL NAME */}
          <div>
            <label className="text-sm font-semibold text-slate-700">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full mt-1 px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your full name"
            />
          </div>

          {/* YEAR OF STUDY */}
          <div>
            <label className="text-sm font-semibold text-slate-700">Year of Study</label>
            <input
              type="text"
              value={yearOfStudy}
              onChange={(e) => setYearOfStudy(e.target.value)}
              className="w-full mt-1 px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500"
              placeholder="E.g. 1st Year, 2nd Year"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-sm font-semibold text-slate-700">Email</label>
            <input
              type="email"
              value={user?.email}
              disabled
              className="w-full mt-1 px-4 py-3 border border-slate-200 bg-slate-100 rounded-xl"
            />
          </div>

        </div>

      </div>
    </main>
  );
}
