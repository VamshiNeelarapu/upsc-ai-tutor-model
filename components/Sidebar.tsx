"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  User,
  LogOut,
  Plus,
  ChevronDown,
  ChevronRight,
  X,
} from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { SyllabusTree } from "./SyllabusTree";
import type { SyllabusTreeNode } from "./SyllabusTree";

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthContext();
  const [syllabus, setSyllabus] = useState<SyllabusTreeNode[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [syllabusOpen, setSyllabusOpen] = useState(true);
  const [conversationsOpen, setConversationsOpen] = useState(true);

  useEffect(() => {
    // Load syllabus
    fetch("/api/syllabus")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setSyllabus(data);
      })
      .catch(() => {});

    // Load recent conversations
    fetch("/api/conversations")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setConversations(data.slice(0, 10));
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/notes", label: "My Notes", icon: FileText },
    { href: "/account", label: "Account", icon: User },
  ];

  return (
    <aside
      className={clsx(
        "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 flex flex-col transition-transform duration-200 ease-in-out",
        "lg:relative lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
      aria-label="Main navigation"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-slate-800 flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden="true">📚</span>
          <span className="font-bold text-white text-sm">UPSC AI</span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto py-3 space-y-1">
        {/* Main navigation */}
        <nav aria-label="Main pages">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-4 py-2 text-sm transition-colors mx-2 rounded-md",
                pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
                  ? "bg-slate-800 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
              aria-current={pathname === href ? "page" : undefined}
            >
              <Icon size={16} aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-slate-800 my-2" />

        {/* New Chat button */}
        <div className="px-2">
          <Link
            href="/chat"
            className={clsx(
              "flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors",
              "bg-blue-600 text-white hover:bg-blue-500",
              pathname === "/chat" && "bg-blue-500"
            )}
          >
            <Plus size={16} aria-hidden="true" />
            New Chat
          </Link>
        </div>

        {/* Recent Conversations */}
        <div className="px-2">
          <button
            onClick={() => setConversationsOpen(!conversationsOpen)}
            className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider rounded hover:text-slate-300"
          >
            <span>Recent Chats</span>
            {conversationsOpen ? (
              <ChevronDown size={12} />
            ) : (
              <ChevronRight size={12} />
            )}
          </button>

          {conversationsOpen && (
            <div className="mt-1 space-y-0.5">
              {conversations.length === 0 ? (
                <p className="text-xs text-slate-500 px-2 py-2">No conversations yet</p>
              ) : (
                conversations.map((conv) => (
                  <Link
                    key={conv.id}
                    href={`/chat/${conv.id}`}
                    className={clsx(
                      "flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors truncate",
                      pathname === `/chat/${conv.id}` && "bg-slate-800 text-white"
                    )}
                    title={conv.title}
                  >
                    <MessageSquare size={12} className="flex-shrink-0" aria-hidden="true" />
                    <span className="truncate">{conv.title}</span>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>

        <div className="border-t border-slate-800 my-2" />

        {/* Syllabus Tree */}
        <div className="px-2">
          <button
            onClick={() => setSyllabusOpen(!syllabusOpen)}
            className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider rounded hover:text-slate-300"
          >
            <span>Syllabus</span>
            {syllabusOpen ? (
              <ChevronDown size={12} />
            ) : (
              <ChevronRight size={12} />
            )}
          </button>

          {syllabusOpen && (
            <div className="mt-1">
              <SyllabusTree
                nodes={syllabus}
                onNodeSelect={() => {
                  // Close mobile sidebar on selection
                  onClose?.();
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* User menu at bottom */}
      <div className="border-t border-slate-800 p-3 flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
        >
          <LogOut size={14} aria-hidden="true" />
          Sign out
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
