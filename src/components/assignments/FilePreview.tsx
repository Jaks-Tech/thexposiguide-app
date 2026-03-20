"use client";

import { useState } from "react";
import { Loader2, ExternalLink, FileText, Eye, EyeOff } from "lucide-react";

interface FilePreviewProps {
  fileUrl: string | null;
}

export default function FilePreview({ fileUrl }: FilePreviewProps) {
  // 1. New state to track if the preview is expanded (defaults to closed)
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (!fileUrl) return null;

  // Route the URL through Google's embed viewer
  const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`;

  return (
    <div 
      className={`bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col transition-all duration-500 ease-in-out ${
        isOpen ? 'h-[700px] md:h-[800px]' : 'h-auto'
      }`}
    >
      
      {/* 🏷️ Header (Always Visible) */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-xl">
            <FileText className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Document Attachment
          </h3>
        </div>
        
        <div className="flex items-center gap-3">
          {/* ❌ Close Button (Only shows when the preview is open) */}
          {isOpen && (
            <button 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-full transition-colors"
            >
              <EyeOff className="w-3.5 h-3.5" />
              Close Preview
            </button>
          )}

          {/* ✨ External Link Button */}
          <a 
            href={fileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-xs font-bold text-slate-600 hover:text-indigo-700 rounded-full transition-all duration-300 shadow-sm hover:shadow"
          >
            <span>Open in new tab</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all duration-300" />
          </a>
        </div>
      </div>

      {/* 📄 Dynamic Body Content */}
      {!isOpen ? (
        
        /* 🔒 CLOSED STATE: Premium SaaS Message */
        <div className="flex flex-col items-center justify-center py-12 px-4 bg-slate-50/50 border border-slate-200 border-dashed rounded-2xl text-center animate-in fade-in duration-500">
          <div className="w-16 h-16 bg-white border border-slate-100 shadow-sm rounded-2xl flex items-center justify-center mb-5 text-indigo-500">
            <Eye className="w-8 h-8 opacity-80" />
          </div>
          <h4 className="text-lg font-bold text-slate-900 mb-2">Live Preview Available</h4>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-8 leading-relaxed">
            You can view this document securely in your browser without downloading it. Loading the viewer uses external services.
          </p>
          <button 
            onClick={() => {
              setIsOpen(true);
              setIsLoading(true); // Reset loader just in case
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview the attachment
          </button>
        </div>

      ) : (
        
        /* 📖 OPEN STATE: The Google Docs Iframe */
        <div className="relative flex-grow rounded-2xl overflow-hidden bg-slate-50/50 border border-slate-200 shadow-inner animate-in fade-in duration-500">
          
          {/* ⏳ Premium Loading State */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 backdrop-blur-sm z-20 transition-opacity duration-500">
              <div className="flex flex-col items-center gap-4 bg-white px-6 py-5 rounded-2xl shadow-xl border border-slate-100 animate-in fade-in zoom-in duration-300">
                <div className="p-3 bg-indigo-50 rounded-full">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                </div>
                <span className="text-sm font-semibold text-slate-600 tracking-wide">
                  Loading viewer...
                </span>
              </div>
            </div>
          )}
          
          <iframe
            src={viewerUrl}
            className="w-full h-full border-none relative z-10 bg-white"
            title="File Preview"
            onLoad={() => setIsLoading(false)}
          />
        </div>

      )}
    </div>
  );
}