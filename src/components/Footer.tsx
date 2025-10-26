export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900 text-gray-200 border-t border-gray-600 mt-12">
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <p className="text-sm text-gray-300 max-w-2xl mx-auto">
          <strong>Disclaimer:</strong> This resource is for educational use only.
          Always follow institutional protocols and radiologist guidance.
        </p>

        <hr className="my-4 border-gray-600 w-2/3 mx-auto" />

        <p className="text-sm text-gray-400">
          © {new Date().getFullYear()} <strong>The XPosiGuide</strong>. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
