export default function PelvicGirdlePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 py-10 text-center">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">
        Pelvic Girdle
      </h1>

      <p className="text-neutral-700 max-w-2xl mb-6">
        The pelvic girdle module provides positioning references for pelvis and hip projections — 
        including AP pelvis, hip, inlet/outlet, and frog-leg views.
      </p>

      {/* Separated footer disclaimer */}
      <footer className="mt-12 border-t border-neutral-200 pt-6 pb-6 text-sm text-neutral-500 text-center w-full">
        <p className="max-w-2xl mx-auto px-4">
          <strong>Disclaimer:</strong> Educational use only. Always follow institutional
          protocols and radiologist directives.
        </p>
      </footer>
    </main>
  );
}
