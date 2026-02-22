"use client";

import { useState, useRef, useEffect } from "react";
import { SCHOOLS, YEARS } from "@/lib/constants";

type WalkinState = "form" | "submitting" | "success" | "existing";

interface WalkinResult {
  id: string;
  full_name: string;
  email: string;
  checked_in: boolean;
  checked_in_at: string | null;
}

interface FormErrors {
  full_name?: string;
  email?: string;
  phone?: string;
  school?: string;
  school_other?: string;
  year?: string;
}

export default function WalkinPage() {
  const [state, setState] = useState<WalkinState>("form");
  const [result, setResult] = useState<WalkinResult | null>(null);
  const [serverError, setServerError] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [school, setSchool] = useState("");
  const [schoolOther, setSchoolOther] = useState("");
  const [year, setYear] = useState("");

  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      newErrors.full_name = "Name must be at least 2 characters";
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Invalid email address";
    }
    if (!phone.trim() || phone.trim().length < 10) {
      newErrors.phone = "Phone number must be at least 10 digits";
    }
    if (!school) {
      newErrors.school = "Select a school";
    }
    if (school === "Other" && (!schoolOther.trim() || schoolOther.trim().length === 0)) {
      newErrors.school_other = "Please specify your school";
    }
    if (!year) {
      newErrors.year = "Select your year";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setState("submitting");
    setServerError("");

    try {
      const res = await fetch("/api/walkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          school,
          school_other: school === "Other" ? schoolOther.trim() : undefined,
          year,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error || "Something went wrong");
        setState("form");
        return;
      }

      setResult(data.participant);
      setState(data.existing ? "existing" : "success");
    } catch {
      setServerError("Network error. Please try again.");
      setState("form");
    }
  };

  const handleReset = () => {
    setState("form");
    setResult(null);
    setServerError("");
    setErrors({});
    setFullName("");
    setEmail("");
    setPhone("");
    setSchool("");
    setSchoolOther("");
    setYear("");
    setTimeout(() => nameRef.current?.focus(), 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Success state
  if (state === "success" && result) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#006241] text-white font-bold text-xl mb-4">
              G
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#006241]/10 mb-4">
              <svg
                className="w-8 h-8 text-[#006241]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#006241] mb-1">
              Welcome, {result.full_name}!
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              You&apos;re registered and checked in.
            </p>
            <button
              onClick={handleReset}
              className="inline-flex items-center justify-center rounded-lg font-medium text-sm px-6 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Register another walk-in
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Existing participant state
  if (state === "existing" && result) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#006241] text-white font-bold text-xl mb-4">
              G
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-50 mb-3">
              <svg
                className="w-7 h-7 text-amber-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Already registered
            </h3>
            <p className="text-sm text-gray-600 mb-1">{result.full_name}</p>
            <p className="text-xs text-gray-400 mb-4">{result.email}</p>
            {result.checked_in ? (
              <p className="text-sm text-[#006241] font-medium mb-4">
                Already checked in
                {result.checked_in_at && (
                  <span className="text-gray-400 font-normal">
                    {" "}
                    at{" "}
                    {new Date(result.checked_in_at).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                )}
              </p>
            ) : (
              <p className="text-sm text-amber-600 font-medium mb-4">
                Not yet checked in &mdash; please use the check-in page.
              </p>
            )}
            <button
              onClick={handleReset}
              className="inline-flex items-center justify-center rounded-lg font-medium text-sm px-6 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Register another walk-in
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Form state
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md mx-auto">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#006241] text-white font-bold text-xl mb-4">
            G
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Walk-In Registration</h1>
          <p className="text-gray-500 mt-1">Generator Build-a-thon 2026</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-6">
            Quick Registration
          </h2>

          {serverError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600 text-center">{serverError}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="walkin-name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                ref={nameRef}
                id="walkin-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Jane Smith"
                className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                  errors.full_name
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-[#006241] focus:border-[#006241]"
                }`}
                autoComplete="name"
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="walkin-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="walkin-email"
                type="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="jane@babson.edu"
                className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                  errors.email
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-[#006241] focus:border-[#006241]"
                }`}
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="walkin-phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                id="walkin-phone"
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="(555) 123-4567"
                className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                  errors.phone
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-[#006241] focus:border-[#006241]"
                }`}
                autoComplete="tel"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* School */}
            <div>
              <label htmlFor="walkin-school" className="block text-sm font-medium text-gray-700 mb-1">
                School
              </label>
              <select
                id="walkin-school"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 bg-white ${
                  errors.school
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-[#006241] focus:border-[#006241]"
                }`}
              >
                <option value="" disabled>
                  Select school
                </option>
                {SCHOOLS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.school && (
                <p className="mt-1 text-sm text-red-600">{errors.school}</p>
              )}
            </div>

            {/* School Other */}
            {school === "Other" && (
              <div>
                <label htmlFor="walkin-school-other" className="block text-sm font-medium text-gray-700 mb-1">
                  Your School
                </label>
                <input
                  id="walkin-school-other"
                  type="text"
                  value={schoolOther}
                  onChange={(e) => setSchoolOther(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="University name"
                  className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                    errors.school_other
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-[#006241] focus:border-[#006241]"
                  }`}
                />
                {errors.school_other && (
                  <p className="mt-1 text-sm text-red-600">{errors.school_other}</p>
                )}
              </div>
            )}

            {/* Year */}
            <div>
              <label htmlFor="walkin-year" className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <select
                id="walkin-year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 bg-white ${
                  errors.year
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-[#006241] focus:border-[#006241]"
                }`}
              >
                <option value="" disabled>
                  Select year
                </option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              {errors.year && (
                <p className="mt-1 text-sm text-red-600">{errors.year}</p>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={state === "submitting"}
            className="w-full mt-6 rounded-xl font-semibold text-lg px-6 py-4 bg-[#006241] text-white hover:bg-[#004d33] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {state === "submitting" ? (
              <span className="inline-flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Registering...
              </span>
            ) : (
              "Register & Check In"
            )}
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center mt-6">
          For event-day walk-ins only. Already registered? Use the{" "}
          <a href="/checkin" className="text-[#006241] hover:underline">
            check-in page
          </a>
          .
        </p>
      </div>
    </div>
  );
}
