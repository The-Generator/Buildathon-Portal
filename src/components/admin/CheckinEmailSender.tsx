"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Send } from "lucide-react";

interface CheckinEmailSenderProps {
  adminToken: string;
}

export function CheckinEmailSender({ adminToken }: CheckinEmailSenderProps) {
  const [testEmail, setTestEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [confirmSendAll, setConfirmSendAll] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number; test?: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendTestEmail = async () => {
    if (!testEmail.trim()) return;
    setSending(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/admin/checkin-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ test_email: testEmail.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to send test email");
        return;
      }

      const data = await res.json();
      setResult(data);
    } catch {
      setError("Network error");
    } finally {
      setSending(false);
    }
  };

  const sendToAll = async () => {
    setSending(true);
    setResult(null);
    setError(null);
    setConfirmSendAll(false);

    try {
      const res = await fetch("/api/admin/checkin-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to send emails");
        return;
      }

      const data = await res.json();
      setResult(data);
    } catch {
      setError("Network error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-center gap-2 mb-4">
        <Mail className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Check-In Reminder Email</h3>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Send check-in reminder emails so participants can check in online and skip the line at the door.
      </p>

      {/* Test email */}
      <div className="flex gap-2 mb-4">
        <input
          type="email"
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          placeholder="Test email address"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-emerald-800"
        />
        <Button
          size="sm"
          variant="outline"
          disabled={sending || !testEmail.trim()}
          onClick={sendTestEmail}
        >
          {sending ? "Sending..." : "Send Test"}
        </Button>
      </div>

      {/* Send to all */}
      {!confirmSendAll ? (
        <Button
          disabled={sending}
          onClick={() => setConfirmSendAll(true)}
          className="w-full"
        >
          <Send className="h-4 w-4 mr-2" />
          Send to All Participants
        </Button>
      ) : (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800 font-medium mb-3">
            This will send a check-in reminder email to all registered participants. Continue?
          </p>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              disabled={sending}
              onClick={sendToAll}
            >
              {sending ? "Sending..." : "Yes, Send to All"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={sending}
              onClick={() => setConfirmSendAll(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className={`mt-4 rounded-lg p-3 text-sm ${
          result.failed > 0
            ? "bg-amber-50 border border-amber-200 text-amber-800"
            : "bg-emerald-50 border border-emerald-200 text-emerald-800"
        }`}>
          {result.test ? (
            <p>Test email {result.sent > 0 ? "sent successfully" : "failed to send"}.</p>
          ) : (
            <p>
              Sent: {result.sent}
              {result.failed > 0 && <span className="ml-2">Failed: {result.failed}</span>}
            </p>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
