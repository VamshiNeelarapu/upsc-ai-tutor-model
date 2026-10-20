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
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  const fetchSyllabus = () => {
    fetch("/api/syllabus")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setSyllabus(data); })
      .catch(() => {});
  };

  useEffect(() => {
    fetchSyllabus();

    fetch("/api/conversations")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setConversations(data.slice(0, 3)); })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
        "fixed inset-y-0 left-0 z-50 w-64 bg-[#1e2d22] flex flex-col transition-transform duration-200 ease-in-out",
        "lg:relative lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
      aria-label="Main navigation"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-[#2c4030] flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden="true">📚</span>
          <span className="font-bold text-[#e8f0eb] text-sm">UPSC AI</span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden text-[#7a9e84] hover:text-[#e8f0eb]"
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
                  ? "bg-[#294032] text-[#e8f0eb]"
                  : "text-[#a0bfa8] hover:bg-[#253829] hover:text-[#e8f0eb]"
              )}
              aria-current={pathname === href ? "page" : undefined}
            >
              <Icon size={16} aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-[#2c4030] my-2" />

        {/* New Chat button */}
        <div className="px-2">
          <Link
            href="/chat"
            className={clsx(
              "flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors",
              "bg-[#457a5a] text-white hover:bg-[#376249]",
              pathname === "/chat" && "bg-[#376249]"
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
            className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-semibold text-[#7a9e84] uppercase tracking-wider rounded hover:text-[#a0bfa8]"
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
                <p className="text-xs text-[#6b8873] px-2 py-2">No conversations yet</p>
              ) : (
                conversations.map((conv) => (
                  <Link
                    key={conv.id}
                    href={`/chat/${conv.id}`}
                    className={clsx(
                      "flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-[#a0bfa8] hover:bg-[#253829] hover:text-[#e8f0eb] transition-colors truncate",
                      pathname === `/chat/${conv.id}` && "bg-[#294032] text-[#e8f0eb]"
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

        <div className="border-t border-[#2c4030] my-2" />

        {/* Syllabus Tree */}
        <div className="px-2">
          <button
            onClick={() => setSyllabusOpen(!syllabusOpen)}
            className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-semibold text-[#7a9e84] uppercase tracking-wider rounded hover:text-[#a0bfa8]"
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
                editable
                onMutate={fetchSyllabus}
                onNodeSelect={(node) => {
                  if (node.nodeType === "topic") {
                    router.push(`/notes?topicId=${node.id}`);
                  } else if (node.nodeType === "section") {
                    router.push(`/notes?sectionId=${node.id}`);
                  }
                  onClose?.();
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* User menu at bottom */}
      <div className="border-t border-[#2c4030] p-3 flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-[#457a5a] flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#e8f0eb] truncate">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-[#7a9e84] truncate">{user?.email}</p>
          </div>
        </div>
        {logoutConfirm ? (
          <div className="rounded-md bg-[#1a2e1e] border border-[#2c4030] px-3 py-2 text-xs">
            <p className="text-[#e8f0eb] mb-2">Sign out of UPSC AI?</p>
            <div className="flex gap-2">
              <button
                onClick={handleLogout}
                className="flex-1 py-1 rounded bg-[#b94040] text-white font-medium hover:bg-[#9e3535] transition-colors"
              >
                Yes, sign out
              </button>
              <button
                onClick={() => setLogoutConfirm(false)}
                className="flex-1 py-1 rounded bg-[#253829] text-[#a0bfa8] hover:bg-[#2c4030] hover:text-[#e8f0eb] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setLogoutConfirm(true)}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-[#7a9e84] hover:text-[#e8f0eb] hover:bg-[#253829] rounded-md transition-colors"
          >
            <LogOut size={14} aria-hidden="true" />
            Sign out
          </button>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
