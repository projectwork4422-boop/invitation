"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  UserX,
  MessageSquare,
  Search,
  Download,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Heart,
  Clock,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Trash2,
} from "lucide-react";
import { WEDDING_CONFIG } from "@/config/wedding";
import { RsvpRecord } from "@/lib/db";

export default function ResponsesPage() {
  const { couple, event } = WEDDING_CONFIG;

  const [responses, setResponses] = useState<RsvpRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "attending" | "declined">("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [themeMode, setThemeMode] = useState<"dark" | "light">("dark");
  const isDark = themeMode === "dark";
  const [deleteTarget, setDeleteTarget] = useState<RsvpRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionToast, setActionToast] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!deleteTarget || deleteTarget.id === undefined) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/rsvp?id=${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete response");
      }

      const deletedName = deleteTarget.guest_name;
      // Immediately remove from UI state
      setResponses((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
      setActionToast(`Successfully deleted response from "${deletedName}".`);
      setTimeout(() => {
        setActionToast(null);
      }, 4000);
    } catch (err) {
      console.error(err);
      alert((err as Error).message || "Could not delete response. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchResponses = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/rsvp", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load responses");
      const data = await res.json();
      setResponses(data.rsvps || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Unable to load responses. Please check connection and try again.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchResponses();
  }, []);

  // Filtered responses
  const filteredResponses = useMemo(() => {
    return responses.filter((item) => {
      const itemStatus = (item.attendance || "").trim().toLowerCase();
      const matchesFilter =
        filterStatus === "all" ? true : itemStatus === filterStatus;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (item.guest_name || "").toLowerCase().includes(q) ||
        (item.message && item.message.toLowerCase().includes(q));
      return matchesFilter && matchesSearch;
    });
  }, [responses, filterStatus, searchQuery]);

  // Reset to first page when filtering or searching
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchQuery, itemsPerPage]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredResponses.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedResponses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredResponses.slice(start, start + itemsPerPage);
  }, [filteredResponses, currentPage, itemsPerPage]);

  const getPaginationRange = (current: number, total: number) => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pages: (number | string)[] = [];
    if (current <= 3) {
      pages.push(1, 2, 3, 4, "...", total);
    } else if (current >= total - 2) {
      pages.push(1, "...", total - 3, total - 2, total - 1, total);
    } else {
      pages.push(1, "...", current - 1, current, current + 1, "...", total);
    }
    return pages;
  };

  // Aggregate Stats
  const stats = useMemo(() => {
    const total = responses.length;
    const attendingList = responses.filter(
      (r) => (r.attendance || "").trim().toLowerCase() === "attending"
    );
    const declinedList = responses.filter(
      (r) => (r.attendance || "").trim().toLowerCase() === "declined"
    );
    const totalGuests = attendingList.reduce(
      (acc, curr) => acc + (Number(curr.guest_count) || 1),
      0
    );

    return {
      total,
      attendingParties: attendingList.length,
      declinedParties: declinedList.length,
      totalGuests,
    };
  }, [responses]);

  // Export to CSV
  const handleExportCsv = () => {
    if (!responses.length) return;

    const headers = [
      "ID",
      "Guest Name",
      "Attendance",
      "Number of Guests",
      "Wishes & Duas",
      "Submitted Date",
    ];

    const rows = responses.map((r) => [
      r.id ?? "",
      `"${(r.guest_name || "").replace(/"/g, '""')}"`,
      (r.attendance || "").trim().toLowerCase() === "attending" ? "Attending" : "Declined",
      (r.attendance || "").trim().toLowerCase() === "attending" ? (r.guest_count || 1) : 0,
      `"${(r.message || "").replace(/"/g, '""')}"`,
      r.created_at ? new Date(r.created_at).toLocaleString() : "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `wedding-rsvps-${couple.groom.name.replace(/\s+/g, "_")}-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "Recently";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-200 ${
        isDark
          ? "bg-[#000000] text-white selection:bg-white selection:text-black"
          : "bg-[#FAFAFA] text-zinc-900 selection:bg-black selection:text-white"
      }`}
    >
      {/* Top Banner Navigation */}
      <header
        className={`sticky top-0 z-30 w-full backdrop-blur-md border-b py-4 px-4 sm:px-8 transition-colors ${
          isDark
            ? "bg-[#000000]/95 border-zinc-800"
            : "bg-white/95 border-zinc-200"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className={`inline-flex items-center gap-2 text-xs sm:text-sm font-sans uppercase tracking-wider transition-colors ${
              isDark
                ? "text-zinc-300 hover:text-white"
                : "text-zinc-700 hover:text-black"
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Invitation</span>
          </Link>

          <div
            className={`font-cormorant text-base sm:text-xl font-normal tracking-wider uppercase text-center hidden sm:block ${
              isDark ? "text-zinc-200" : "text-zinc-800"
            }`}
          >
            {couple.combinedName}
          </div>

          <div className="flex items-center gap-2">
            {/* Black / White Theme Toggle */}
            <button
              type="button"
              onClick={() => setThemeMode(isDark ? "light" : "dark")}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full border text-xs font-sans uppercase tracking-wider transition-all ${
                isDark
                  ? "bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-200"
                  : "bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-800"
              }`}
              title={isDark ? "Switch to White Background" : "Switch to Black Background"}
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-zinc-200" />
                  <span className="hidden sm:inline">White Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-zinc-800" />
                  <span className="hidden sm:inline">Black Mode</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              disabled={loading || !responses.length}
              className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border text-xs font-sans uppercase tracking-wider transition-all disabled:opacity-40 ${
                isDark
                  ? "bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-200"
                  : "bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-800"
              }`}
              title="Download CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Export CSV</span>
            </button>

            <button
              type="button"
              onClick={fetchResponses}
              disabled={isRefreshing}
              className={`inline-flex items-center justify-center p-2 rounded-full border transition-all disabled:opacity-50 ${
                isDark
                  ? "bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white"
                  : "bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-700 hover:text-black"
              }`}
              title="Refresh Responses"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Page Header */}
        <div className="text-center mb-10 sm:mb-12">
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-sans tracking-widest uppercase mb-3 font-semibold border ${
              isDark
                ? "bg-zinc-900 border-zinc-700 text-zinc-200"
                : "bg-zinc-100 border-zinc-300 text-zinc-800"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Guest Registry</span>
          </div>

          <h1
            className={`font-cormorant text-3xl sm:text-4xl md:text-5xl font-normal tracking-wide ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            Submitted RSVP Responses
          </h1>

          <p
            className={`font-sans text-xs sm:text-sm mt-2 max-w-lg mx-auto ${
              isDark ? "text-zinc-400" : "text-zinc-600"
            }`}
          >
            Celebration of Nikāh on {event.dateFormatted} at {event.venueName}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-10">
          {/* Total Responses */}
          <button
            type="button"
            onClick={() => setFilterStatus("all")}
            className={`p-5 sm:p-6 rounded-2xl text-left border transition-all flex flex-col justify-between cursor-pointer ${
              isDark
                ? filterStatus === "all"
                  ? "bg-[#0A0A0A] border-white ring-1 ring-white/50 text-white"
                  : "bg-[#0A0A0A] border-zinc-800 hover:border-zinc-700 text-zinc-200"
                : filterStatus === "all"
                ? "bg-white border-black ring-1 ring-black/50 text-black shadow-md"
                : "bg-white border-zinc-200 hover:border-zinc-300 text-zinc-800 shadow-sm"
            }`}
          >
            <div className={`flex items-center justify-between mb-2 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
              <span className="text-xs uppercase font-sans tracking-wider">Responses</span>
              <Users className="w-4 h-4" />
            </div>
            <div className={`text-2xl sm:text-3xl font-cormorant font-semibold ${isDark ? "text-white" : "text-black"}`}>
              {stats.total}
            </div>
            <span className={`text-[11px] font-sans mt-1 ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
              Total Parties
            </span>
          </button>

          {/* Total Guests Attending */}
          <div
            className={`p-5 sm:p-6 rounded-2xl border flex flex-col justify-between ${
              isDark
                ? "bg-[#0A0A0A] border-zinc-800 text-white"
                : "bg-white border-zinc-200 text-black shadow-sm"
            }`}
          >
            <div className={`flex items-center justify-between mb-2 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
              <span className="text-xs uppercase font-sans tracking-wider">Total Guests</span>
              <UserCheck className="w-4 h-4" />
            </div>
            <div className={`text-2xl sm:text-3xl font-cormorant font-semibold ${isDark ? "text-white" : "text-black"}`}>
              {stats.totalGuests}
            </div>
            <span className={`text-[11px] font-sans mt-1 ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
              Confirmed Attending
            </span>
          </div>

          {/* Joyfully Attending */}
          <button
            type="button"
            onClick={() => setFilterStatus("attending")}
            className={`p-5 sm:p-6 rounded-2xl text-left border transition-all flex flex-col justify-between cursor-pointer ${
              isDark
                ? filterStatus === "attending"
                  ? "bg-[#0A0A0A] border-emerald-500/80 ring-1 ring-emerald-500/40 text-emerald-300"
                  : "bg-[#0A0A0A] border-zinc-800 hover:border-zinc-700 text-zinc-200"
                : filterStatus === "attending"
                ? "bg-white border-emerald-600 ring-1 ring-emerald-600/40 text-emerald-700 shadow-md"
                : "bg-white border-zinc-200 hover:border-zinc-300 text-zinc-800 shadow-sm"
            }`}
          >
            <div className={`flex items-center justify-between mb-2 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
              <span className="text-xs uppercase font-sans tracking-wider">Accepted</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className={`text-2xl sm:text-3xl font-cormorant font-semibold ${isDark ? "text-emerald-300" : "text-emerald-600"}`}>
              {stats.attendingParties}
            </div>
            <span className={`text-[11px] font-sans mt-1 ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
              Joyfully Attending
            </span>
          </button>

          {/* Regretfully Declined */}
          <button
            type="button"
            onClick={() => setFilterStatus("declined")}
            className={`p-5 sm:p-6 rounded-2xl text-left border transition-all flex flex-col justify-between cursor-pointer ${
              isDark
                ? filterStatus === "declined"
                  ? "bg-[#0A0A0A] border-zinc-400 ring-1 ring-zinc-400/40 text-zinc-200"
                  : "bg-[#0A0A0A] border-zinc-800 hover:border-zinc-700 text-zinc-200"
                : filterStatus === "declined"
                ? "bg-white border-zinc-500 ring-1 ring-zinc-500/40 text-zinc-800 shadow-md"
                : "bg-white border-zinc-200 hover:border-zinc-300 text-zinc-800 shadow-sm"
            }`}
          >
            <div className={`flex items-center justify-between mb-2 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
              <span className="text-xs uppercase font-sans tracking-wider">Declined</span>
              <UserX className="w-4 h-4 text-zinc-400" />
            </div>
            <div className={`text-2xl sm:text-3xl font-cormorant font-semibold ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>
              {stats.declinedParties}
            </div>
            <span className={`text-[11px] font-sans mt-1 ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
              In Our Duas
            </span>
          </button>
        </div>

        {/* Filter and Search Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
          {/* Status Tabs */}
          <div
            className={`inline-flex rounded-xl p-1 text-xs font-sans border ${
              isDark
                ? "bg-[#0A0A0A] border-zinc-800"
                : "bg-zinc-100 border-zinc-200"
            }`}
          >
            <button
              type="button"
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === "all"
                  ? isDark
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "bg-black text-white font-semibold shadow-sm"
                  : isDark
                  ? "text-zinc-400 hover:text-white"
                  : "text-zinc-600 hover:text-black"
              }`}
            >
              All ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("attending")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === "attending"
                  ? isDark
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "bg-black text-white font-semibold shadow-sm"
                  : isDark
                  ? "text-zinc-400 hover:text-white"
                  : "text-zinc-600 hover:text-black"
              }`}
            >
              Attending ({stats.attendingParties})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("declined")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === "declined"
                  ? isDark
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "bg-black text-white font-semibold shadow-sm"
                  : isDark
                  ? "text-zinc-400 hover:text-white"
                  : "text-zinc-600 hover:text-black"
              }`}
            >
              Declined ({stats.declinedParties})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[260px] md:min-w-[320px]">
            <Search
              className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                isDark ? "text-zinc-500" : "text-zinc-400"
              }`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by guest name or message..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-sans transition-colors focus:outline-none ${
                isDark
                  ? "bg-[#0A0A0A] border-zinc-800 text-white placeholder-zinc-500 focus:border-white"
                  : "bg-white border-zinc-200 text-black placeholder-zinc-400 focus:border-black"
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${
                  isDark ? "text-zinc-400 hover:text-white" : "text-zinc-500 hover:text-black"
                }`}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className={`w-8 h-8 animate-spin mx-auto mb-4 ${isDark ? "text-white" : "text-black"}`} />
            <p className={`font-sans text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
              Loading responses...
            </p>
          </div>
        ) : error ? (
          <div
            className={`p-8 rounded-2xl border text-center max-w-lg mx-auto ${
              isDark
                ? "bg-red-950/30 border-red-800/40 text-red-200"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <XCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <p className="font-sans text-sm mb-4">{error}</p>
            <button
              type="button"
              onClick={fetchResponses}
              className={`px-5 py-2 rounded-full font-sans text-xs uppercase font-semibold ${
                isDark ? "bg-white text-black" : "bg-black text-white"
              }`}
            >
              Try Again
            </button>
          </div>
        ) : filteredResponses.length === 0 ? (
          <div
            className={`py-16 text-center rounded-3xl border max-w-lg mx-auto p-8 ${
              isDark
                ? "bg-[#0A0A0A]/50 border-zinc-800"
                : "bg-white border-zinc-200 shadow-sm"
            }`}
          >
            <MessageSquare
              className={`w-10 h-10 mx-auto mb-3 ${isDark ? "text-zinc-600" : "text-zinc-400"}`}
            />
            <h3 className={`font-cormorant text-2xl ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>
              No Responses Found
            </h3>
            <p className={`font-sans text-xs mt-1 ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
              {searchQuery
                ? `No guest matches "${searchQuery}".`
                : "No RSVP submissions recorded in this category yet."}
            </p>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {paginatedResponses.map((item, index) => {
                const isAttending =
                  (item.attendance || "").trim().toLowerCase() === "attending";
                const uniqueKey = `${item.id ?? "entry"}-${item.guest_name}-${item.created_at ?? index}`;
                return (
                  <div
                    key={uniqueKey}
                    className={`p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                      isDark
                        ? "bg-[#0A0A0A] border-zinc-800 hover:border-zinc-700 shadow-lg"
                        : "bg-white border-zinc-200 hover:border-zinc-300 shadow-sm"
                    }`}
                  >
                    <div>
                      {/* Card Header: Guest Name & Badge */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <h3
                            className={`font-cormorant text-2xl font-medium tracking-wide ${
                              isDark ? "text-white" : "text-black"
                            }`}
                          >
                            {item.guest_name}
                          </h3>
                          <div
                            className={`flex items-center gap-2 text-xs font-sans mt-0.5 ${
                              isDark ? "text-zinc-400" : "text-zinc-500"
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(item.created_at)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-sans font-semibold uppercase tracking-wider shrink-0 border ${
                              isAttending
                                ? isDark
                                  ? "bg-emerald-950/60 border-emerald-600/40 text-emerald-300"
                                  : "bg-emerald-50 border-emerald-300 text-emerald-800"
                                : isDark
                                ? "bg-zinc-900 border-zinc-700 text-zinc-300"
                                : "bg-zinc-100 border-zinc-300 text-zinc-700"
                            }`}
                          >
                            {isAttending ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>Attending ({item.guest_count})</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 text-zinc-400" />
                                <span>Declined</span>
                              </>
                            )}
                          </span>

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(item)}
                            className={`p-1.5 rounded-lg border transition-all ${
                              isDark
                                ? "bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-500/50 hover:bg-red-950/30"
                                : "bg-zinc-100 border-zinc-200 text-zinc-500 hover:text-red-600 hover:border-red-400 hover:bg-red-50"
                            }`}
                            title={`Delete response from ${item.guest_name}`}
                            aria-label={`Delete response from ${item.guest_name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Guest Count Breakdown */}
                      {isAttending && (
                        <div
                          className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md mb-3 font-sans border ${
                            isDark
                              ? "bg-zinc-900 border-zinc-800 text-zinc-300"
                              : "bg-zinc-100 border-zinc-200 text-zinc-800"
                          }`}
                        >
                          <Users className="w-3 h-3" />
                          <span>
                            Party Size: {item.guest_count}{" "}
                            {item.guest_count === 1 ? "Guest" : "Guests"}
                          </span>
                        </div>
                      )}

                      {/* Wishes & Message */}
                      {item.message ? (
                        <div
                          className={`mt-2 p-3.5 rounded-xl border font-sans text-xs sm:text-sm leading-relaxed italic ${
                            isDark
                              ? "bg-zinc-900/60 border-zinc-800 text-zinc-200"
                              : "bg-zinc-50 border-zinc-200 text-zinc-800"
                          }`}
                        >
                          <span className={`not-italic mr-1 font-serif text-sm ${isDark ? "text-white" : "text-black"}`}>
                            “
                          </span>
                          {item.message}
                          <span className={`not-italic ml-1 font-serif text-sm ${isDark ? "text-white" : "text-black"}`}>
                            ”
                          </span>
                        </div>
                      ) : (
                        <p
                          className={`mt-2 text-xs font-sans italic ${
                            isDark ? "text-zinc-500" : "text-zinc-400"
                          }`}
                        >
                          No additional message provided.
                        </p>
                      )}
                    </div>

                    <div
                      className={`mt-4 pt-3 border-t flex items-center justify-between text-[11px] font-sans ${
                        isDark ? "border-zinc-800 text-zinc-500" : "border-zinc-200 text-zinc-500"
                      }`}
                    >
                      <span>Entry #{item.id ?? index + 1}</span>
                      <span
                        className={`inline-flex items-center gap-1 ${
                          isDark ? "text-zinc-300" : "text-zinc-700"
                        }`}
                      >
                        <Heart
                          className={`w-3 h-3 ${isDark ? "fill-white text-white" : "fill-black text-black"}`}
                        />
                        BarakAllahu Feekum
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Toolbar */}
            {filteredResponses.length > 0 && (
              <div
                className={`mt-8 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${
                  isDark ? "border-zinc-800" : "border-zinc-200"
                }`}
              >
                {/* Result count & Items Per Page */}
                <div
                  className={`flex flex-wrap items-center gap-4 text-xs font-sans ${
                    isDark ? "text-zinc-400" : "text-zinc-600"
                  }`}
                >
                  <span>
                    Showing{" "}
                    <strong className={`font-semibold ${isDark ? "text-white" : "text-black"}`}>
                      {(currentPage - 1) * itemsPerPage + 1}
                    </strong>{" "}
                    to{" "}
                    <strong className={`font-semibold ${isDark ? "text-white" : "text-black"}`}>
                      {Math.min(currentPage * itemsPerPage, filteredResponses.length)}
                    </strong>{" "}
                    of{" "}
                    <strong className={`font-semibold ${isDark ? "text-white" : "text-black"}`}>
                      {filteredResponses.length}
                    </strong>{" "}
                    entries
                  </span>

                  <div
                    className={`flex items-center gap-1.5 pl-3 border-l ${
                      isDark ? "border-zinc-800" : "border-zinc-200"
                    }`}
                  >
                    <span className={isDark ? "text-zinc-500" : "text-zinc-500"}>Per page:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className={`border rounded-lg px-2.5 py-1 text-xs focus:outline-none transition-colors cursor-pointer ${
                        isDark
                          ? "bg-black border-zinc-800 text-white focus:border-white"
                          : "bg-white border-zinc-200 text-black focus:border-black"
                      }`}
                    >
                      <option value={4} className={isDark ? "bg-black text-white" : "bg-white text-black"}>4</option>
                      <option value={6} className={isDark ? "bg-black text-white" : "bg-white text-black"}>6</option>
                      <option value={10} className={isDark ? "bg-black text-white" : "bg-white text-black"}>10</option>
                      <option value={20} className={isDark ? "bg-black text-white" : "bg-white text-black"}>20</option>
                    </select>
                  </div>
                </div>

                {/* Page Navigation Buttons */}
                {totalPages > 1 && (
                  <div className="flex items-center gap-1.5 font-sans">
                    {/* Previous Button */}
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      aria-label="Previous Page"
                      className={`inline-flex items-center justify-center p-2 rounded-xl border transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                        isDark
                          ? "bg-[#0A0A0A] border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-600 disabled:hover:border-zinc-800"
                          : "bg-white border-zinc-200 text-zinc-700 hover:text-black hover:border-zinc-400 disabled:hover:border-zinc-200"
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Page Numbers */}
                    {getPaginationRange(currentPage, totalPages).map((p, i) => {
                      if (typeof p === "string") {
                        return (
                          <span
                            key={`ellipsis-${i}`}
                            className={`px-2 text-xs select-none ${isDark ? "text-zinc-500" : "text-zinc-400"}`}
                          >
                            ...
                          </span>
                        );
                      }
                      const isCurrent = p === currentPage;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setCurrentPage(p)}
                          className={`min-w-[36px] h-9 px-3 rounded-xl text-xs font-medium transition-all ${
                            isCurrent
                              ? isDark
                                ? "bg-white text-black font-semibold shadow-sm"
                                : "bg-black text-white font-semibold shadow-sm"
                              : isDark
                              ? "bg-[#0A0A0A] border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600"
                              : "bg-white border border-zinc-200 text-zinc-600 hover:text-black hover:border-zinc-400"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}

                    {/* Next Button */}
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      aria-label="Next Page"
                      className={`inline-flex items-center justify-center p-2 rounded-xl border transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                        isDark
                          ? "bg-[#0A0A0A] border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-600 disabled:hover:border-zinc-800"
                          : "bg-white border-zinc-200 text-zinc-700 hover:text-black hover:border-zinc-400 disabled:hover:border-zinc-200"
                      }`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div
            className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl transition-all ${
              isDark
                ? "bg-[#111111] border-zinc-800 text-white"
                : "bg-white border-zinc-200 text-zinc-900"
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-950/60 border border-red-800/60 flex items-center justify-center text-red-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-cormorant text-2xl font-medium tracking-wide">
                  Delete Response?
                </h3>
                <p className={`text-xs font-sans ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                  Entry #{deleteTarget.id} • {deleteTarget.guest_name}
                </p>
              </div>
            </div>

            <p className={`text-sm font-sans mb-6 leading-relaxed ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>
              Are you sure you want to permanently delete the RSVP submitted by{" "}
              <strong className={isDark ? "text-white" : "text-black"}>
                {deleteTarget.guest_name}
              </strong>
              ? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 font-sans text-xs">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className={`px-4 py-2 rounded-xl border transition-colors ${
                  isDark
                    ? "border-zinc-800 hover:bg-zinc-800 text-zinc-300"
                    : "border-zinc-200 hover:bg-zinc-100 text-zinc-700"
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-colors inline-flex items-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Response</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Notification Toast */}
      {actionToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-zinc-900 text-white border border-zinc-700 shadow-2xl text-xs font-sans animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionToast}</span>
        </div>
      )}
    </div>
  );
}
