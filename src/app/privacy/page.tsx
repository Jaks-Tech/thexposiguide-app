"use client";
import React from "react";
import Link from "next/link";
import { MdSecurity, MdHistory, MdDataUsage, MdDeleteForever, MdMailOutline, MdShield, MdAutoGraph } from "react-icons/md";

export default function PrivacyPolicy() {
  const currentYear = new Date().getFullYear();
  const lastUpdated = "March 5, 2026";

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      <main className="max-w-4xl mx-auto px-6 py-20">
        <Link href="/" className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-2">
          <span>←</span> Back to Home
        </Link>

        <header className="mt-10 mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-100">
                <MdShield size={28} />
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-slate-900 leading-tight">
              XPosiGuide <br />Privacy Policy
            </h1>
          </div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Last Updated: {lastUpdated}</p>
          <p className="text-lg text-gray-500 mt-6 leading-relaxed border-l-4 border-blue-500 pl-6 italic">
            "We are committed to securing the academic and clinical data of the radiography community."
          </p>
        </header>

        <div className="space-y-16">
          
          {/* INTRO */}
          <section className="text-gray-600 leading-relaxed">
            <p>
              This Privacy Policy describes Our policies on the collection, use, and disclosure of Your information 
              when You use <strong>The XPosiGuide</strong> (including XPosiLearn and XPosi AI). By using the Service, 
              You agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          {/* SECTION 1: DEFINITIONS */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><MdHistory size={24} /></div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">1. Interpretation and Definitions</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="p-4 bg-gray-50 rounded-xl"><strong>Account:</strong> Your unique portal to XPosiLearn and AI tools.</div>
              <div className="p-4 bg-gray-50 rounded-xl"><strong>Company:</strong> Jaks-Tech (operating as The XPosiGuide), Nairobi, Kenya.</div>
              <div className="p-4 bg-gray-50 rounded-xl"><strong>Educational Data:</strong> Uploaded notes, past papers, and module preferences.</div>
              <div className="p-4 bg-gray-50 rounded-xl"><strong>Service:</strong> The XPosiGuide web platform and its associated AI features.</div>
            </div>
          </section>

          {/* SECTION 2: DATA COLLECTION */}
          <section className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-600 rounded-lg text-white"><MdDataUsage size={24} /></div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">2. Information Collection</h2>
            </div>
            <div className="space-y-4 text-gray-600 text-sm">
              <p>To provide a personalized academic experience, we collect:</p>
              <ul className="list-disc pl-6 space-y-2 font-medium">
                <li><strong>Identity:</strong> Name and email address.</li>
                <li><strong>Academic Profile:</strong> University, year of study, and specific radiography modules.</li>
                <li><strong>Document Data:</strong> PDF files uploaded to XPosiLearn or analyzed via Chat-Your-PDF.</li>
              </ul>
              <div className="mt-6 p-4 bg-white rounded-xl border border-blue-100 text-xs italic">
                <strong>Safety Note:</strong> We do not store financial data or bank passwords. All billing (if applicable) is processed by secure, PCI-compliant third-party providers.
              </div>
            </div>
          </section>

          {/* SECTION 3: AI & DOCUMENT SECURITY */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><MdAutoGraph size={24} /></div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">3. AI Processing & Confidentiality</h2>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              When using <strong>XPosi AI</strong> or <strong>Chat-Your-PDF</strong>, your documents are processed in a secure environment. 
            </p>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex gap-2"><span>•</span> Documents are analyzed to provide academic insights only.</li>
              <li className="flex gap-2"><span>•</span> We do not sell your academic notes or clinical documents to third-party datasets.</li>
              <li className="flex gap-2"><span>•</span> Private files uploaded for AI analysis are not made public to other users.</li>
            </ul>
          </section>

          {/* SECTION 4: USE OF DATA */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><MdSecurity size={24} /></div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">4. Use of Your Personal Data</h2>
            </div>
            <ul className="space-y-4 text-gray-600 text-sm leading-relaxed">
              <li><strong>Academic Maintenance:</strong> Managing your uploads and module history.</li>
              <li><strong>Communication:</strong> Sending updates on new past papers, assignments, or platform security.</li>
              <li><strong>AI Optimization:</strong> Improving the accuracy of radiography-specific AI responses.</li>
              <li className="pt-4 text-blue-700 font-bold border-t border-gray-100">
                The XPosiGuide maintains a strict "No-Spam" policy. Your data remains within our educational ecosystem.
              </li>
            </ul>
          </section>

          {/* SECTION 6: DATA CONTROL */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-50 rounded-lg text-red-600"><MdDeleteForever size={24} /></div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">6. User Control & Deletion</h2>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Radiography practitioners and students have full control. You may request the permanent deletion of your 
              uploaded notes and account data at any time by contacting us at 
              <span className="text-blue-600 font-bold underline ml-1 text-xs">hello@jakslab.work</span>.
            </p>
          </section>

          {/* --- CONTACT SECTION --- */}
          <section className="mt-20 p-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-[2.5rem] text-white shadow-xl shadow-blue-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Privacy Support</h3>
                <p className="text-blue-100 text-sm max-w-md">
                  Looking for a resolution regarding data privacy? Our XPosiGuide support team is ready to help.
                </p>
              </div>
              <a 
                href="mailto:hello@jakslab.work" 
                className="flex items-center gap-3 bg-white text-blue-700 px-6 py-4 rounded-2xl font-bold hover:bg-blue-50 transition-all shadow-lg active:scale-95"
              >
                <MdMailOutline size={20} />
                hello@jakslab.work
              </a>
            </div>
            
            <div className="mt-10 pt-8 border-t border-white/10">
              <p className="text-xs font-medium tracking-[0.2em] uppercase text-blue-200 italic opacity-80">
                The XPosiGuide is committed to securing Your Personal Data.
              </p>
            </div>
          </section>

        </div>

        <footer className="mt-24 pt-10 border-t border-gray-100 flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
          <p>© {currentYear} The XPosiGuide by Jaks-Tech</p>
          <p>Nairobi, Kenya</p>
        </footer>
      </main>
    </div>
  );
}