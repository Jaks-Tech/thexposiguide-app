"use client";
import { useEffect, useState } from "react";

export default function SmartScrollNavigator() {
  const [visible, setVisible] = useState(false);
  const [sections, setSections] = useState<{ id: string; text: string }[]>([]);
  const [open, setOpen] = useState(false);

  // Detect scroll visibility
  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-scan the page for headings
  useEffect(() => {
    const headings = Array.from(document.querySelectorAll("h1, h2, h3"));

    const formatted = headings.map((h, i) => {
      // Ensure each heading has an id
      if (!h.id) h.id = `section-${i}`;

      return {
        id: h.id,
        text: h.textContent || `Section ${i + 1}`,
      };
    });

    setSections(formatted);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setOpen(false);
    }
  };

  return (
    <>
      {visible && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">

          {/* MENU POPOVER */}
          {open && (
            <div className="
              mb-3 bg-white rounded-2xl shadow-xl border border-blue-200
              w-60 max-h-72 overflow-y-auto p-3 animate-fadeIn
            ">
              <h4 className="text-blue-700 font-bold text-sm mb-2">Move to...</h4>

              <ul className="space-y-1">
                {sections.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => scrollTo(s.id)}
                      className="
                        w-full text-left px-3 py-2 
                        rounded-xl 
                        text-sm 
                        text-neutral-700 
                        hover:bg-blue-100 hover:text-blue-700 
                        transition
                      "
                    >
                      {s.text}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* MAIN BUTTON */}
          <button
            onClick={() => setOpen((o) => !o)}
            className="
              w-14 h-14 rounded-full bg-blue-600 
              text-white text-2xl 
              flex items-center justify-center
              shadow-xl hover:bg-blue-700 hover:scale-110 
              transition-all duration-300
            "
            title="Navigate page"
          >
            ☰
          </button>
        </div>
      )}
    </>
  );
}
