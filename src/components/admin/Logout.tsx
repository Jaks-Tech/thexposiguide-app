"use client";

import { useRouter } from "next/navigation";
import { PiPowerBold } from "react-icons/pi";

export default function LogoutButton() {
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("admin-auth");
    router.push("/admin/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="
        w-full py-2 mt-2
        bg-red-600 text-white
        hover:bg-red-700
        font-semibold rounded-xl 
        border border-red-700
        shadow-sm hover:shadow
        transition flex items-center justify-center gap-2
      "
    >
      <PiPowerBold size={18} />
      Logout
    </button>
  );
}
