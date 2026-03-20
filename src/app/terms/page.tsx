"use client";
import React from "react";
import Link from "next/link";
import { MdGavel, MdSecurity, MdHistoryEdu, MdBalance, MdMailOutline } from "react-icons/md";

export default function TermsOfService() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      <main className="max-w-4xl mx-auto px-6 py-20">
        <Link href="/" className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-2">
          <span>←</span> Back to Home
        </Link>

        <header className="mt-10 mb-16">
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            Welcome to <span className="text-blue-600 font-semibold">The XPosiGuide</span>. 
            By using our platform, you agree to the following terms operated by Jaks-Tech.
          </p>
        </header>

        <div className="space-y-16">
          
          {/* SECTION A: THE TERMS */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><MdGavel size={24} /></div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">A. The Terms</h2>
            </div>
            <div className="space-y-6 text-gray-600 leading-relaxed">
              <p><strong>1. Acceptance of Terms:</strong> By accessing XPosiLearn, XPosi AI, or our Projection Studio, you are agreeing to comply with and be bound by this agreement, the Privacy Policy, and all disclaimers posted on the Site.</p>
              <p><strong>2. Electronic Communications:</strong> You consent to receive communications from us electronically. You agree that all electronic notices satisfy any legal requirement that such communications be in writing.</p>
              <p><strong>3. Right to Modify:</strong> Jaks-Tech may modify these terms at any time. Changes are effective upon posting. Material changes will be communicated via email.</p>
            </div>
          </section>

          {/* SECTION B: ACADEMIC INTEGRITY */}
          <section className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-600 rounded-lg text-white"><MdHistoryEdu size={24} /></div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">B. Academic Integrity & AI Use</h2>
            </div>
            <div className="space-y-6 text-gray-600 leading-relaxed">
              <p><strong>4. Fair Use:</strong> Any academic materials provided (notes, papers, AI reports) are intended to serve as models or references. You are solely responsible for how you use these materials.</p>
              <p><strong>5. AI Content Disclaimer:</strong> Use of "XPosi AI" is for general guidance. AI-generated outputs are probabilistic and should be cross-referenced with official clinical textbooks.</p>
              <p><strong>6. Clinical Responsibility:</strong> The XPosiGuide is not a licensed medical diagnostic tool. We are not liable for clinical errors arising from the use of our deliverables.</p>
            </div>
          </section>

          {/* SECTION C: ACCOUNTS & CONTENT */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><MdSecurity size={24} /></div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">C. User Accounts & Content</h2>
            </div>
            <div className="space-y-6 text-gray-600 leading-relaxed">
              <p><strong>7. Restricted Activities:</strong> You agree not to upload malicious code, copyright-infringing documents, or content designed to elicit illegal medical activity.</p>
              <p><strong>8. Proprietary Rights:</strong> Upon uploading to XPosiLearn, you grant us a license to host the content for educational use. The "XPosi" brand remains the property of Jaks-Tech.</p>
            </div>
          </section>

          {/* SECTION D: LEGAL STATEMENTS */}
          <section className="border-t border-gray-100 pt-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-slate-900 rounded-lg text-white"><MdBalance size={24} /></div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">D. Legal Statements</h2>
            </div>
            <div className="space-y-6 text-sm text-gray-500 leading-relaxed uppercase">
              <p><strong>9. Exclusion of Warranties:</strong> THE SERVICE IS PROVIDED "AS IS." JAKS-TECH DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED OR ERROR-FREE.</p>
              <p><strong>10. Choice of Law:</strong> These terms are governed by the laws of <strong>Nairobi, Kenya</strong>. All disputes shall be resolved via written notification to hello@jakslab.work.</p>
            </div>
          </section>

          {/* --- NEW QUESTIONS & CONTACT SECTION --- */}
          <section className="mt-20 p-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-[2.5rem] text-white shadow-xl shadow-blue-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Questions about our terms?</h3>
                <p className="text-blue-100 text-sm max-w-md">
                  Reach out to our support team and we'll be happy to help clarify any details.
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
                XPosiGuide is a pertinent platform for learning and development.
              </p>
            </div>
          </section>

        </div>

        <footer className="mt-24 pt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
          <p>© {currentYear} The XPosiGuide by Jaks-Tech</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
            <span className="text-gray-200">|</span>
            <p>Nairobi, Kenya</p>
          </div>
        </footer>
      </main>
    </div>
  );
}