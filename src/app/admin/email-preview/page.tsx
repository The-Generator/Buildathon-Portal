"use client";

import { useState } from "react";
import { render } from "@react-email/render";
import TeamAssignment from "@/lib/email/templates/TeamAssignment";
import CheckInReminder from "@/lib/email/templates/CheckInReminder";

const TEMPLATES = ["Team Assignment", "Check-In + Resources"] as const;
type Template = (typeof TEMPLATES)[number];

const sampleTeamAssignment = {
  participantName: "Jane Doe",
  teamName: "Team Alpha",
  roomNumber: 2,
  teammates: [
    { name: "Alex Smith", school: "Babson College", role: "Developer", email: "asmith@babson.edu", phone: "555-0101" },
    { name: "Maria Garcia", school: "Olin College", role: "Designer", email: "mgarcia@olin.edu" },
    { name: "James Lee", school: "Wellesley College", role: "Data Analyst", email: "jlee@wellesley.edu" },
    { name: "Priya Patel", school: "Bentley University", role: "Business Strategist", email: "ppatel@bentley.edu" },
  ],
  teamSkills: ["AI/ML", "Frontend", "Data Visualization", "Product Strategy"],
};

const sampleCheckIn = {
  participantName: "Jane Doe",
  checkinUrl: "https://babsonbuildathon.com/checkin",
};

async function renderTemplate(template: Template): Promise<string> {
  if (template === "Team Assignment") {
    return await render(TeamAssignment(sampleTeamAssignment), { plainText: false });
  }
  return await render(CheckInReminder(sampleCheckIn), { plainText: false });
}

export default function EmailPreviewPage() {
  const [selected, setSelected] = useState<Template>("Team Assignment");
  const [html, setHtml] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handlePreview = async (template: Template) => {
    setSelected(template);
    setLoading(true);
    try {
      const result = await renderTemplate(template);
      setHtml(result);
    } catch (e) {
      setHtml(`<pre style="color:red">Render error: ${e}</pre>`);
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Email Preview</h2>
        <div className="flex gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t}
              onClick={() => handlePreview(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selected === t && html
                  ? "bg-[#006241] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="text-gray-400 text-sm">Rendering...</div>
      )}

      {html && !loading && (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">{selected}</span>
            <span className="text-xs text-gray-400">Sample data — not a real email</span>
          </div>
          <iframe
            srcDoc={html}
            className="w-full border-0"
            style={{ height: "80vh" }}
            title="Email preview"
          />
        </div>
      )}

      {!html && !loading && (
        <div className="text-gray-400 text-sm">
          Select a template above to preview it.
        </div>
      )}
    </div>
  );
}
