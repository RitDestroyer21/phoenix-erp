"use client";

import { useState } from "react";
import { Menu, ChevronLeft, ChevronRight } from "lucide-react";

import { AllDepartmentsList } from "@/components/erp-components/department-ops";
import { AllDegreesList } from "@/components/erp-components/degree-ops";
import { AllSemestersList } from "@/components/erp-components/semester-ops";
import { AllSubjectsList } from "@/components/erp-components/subjects-ops";

type AdminView = "departments" | "degrees" | "semesters" | "subjects";

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeView, setActiveView] = useState<AdminView>("departments");

  function renderContent() {
    switch (activeView) {
      case "departments":
        return <AllDepartmentsList />;
      case "degrees":
        return <AllDegreesList />;
      case "semesters":
        return <AllSemestersList />;
      case "subjects":
        return <AllSubjectsList />;
      default:
        return null;
    }
  }

return (
    <div className="w-full flex">

        {/* Sidebar */}
        <div
        className={`
            ml-5
            ${collapsed ? "w-20" : "w-64"}
            bg-gray-100 dark:bg-gray-900
            rounded-2xl
            shadow-sm
            transition-all duration-300
            flex flex-col
        `}
        >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
            {!collapsed && <span className="font-semibold">Admin Menu</span>}
            <button onClick={() => setCollapsed(!collapsed)} className="">
            {collapsed ? <span className="flex"><Menu size={18} /><ChevronRight size={18} /></span>: <ChevronLeft size={18} />}
            </button>
        </div>

        {/* Menu */}
        <nav className="flex flex-col p-2 gap-1 text-sm">

            <button
            onClick={() => setActiveView("departments")}
            className={`px-3 py-2 rounded-lg text-left transition ${
                activeView === "departments"
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "hover:bg-gray-200 dark:hover:bg-gray-800"
            }`}
            >
            {collapsed ? "Dept" : "Departments"}
            </button>

            <button
            onClick={() => setActiveView("degrees")}
            className={`px-3 py-2 rounded-lg text-left transition ${
                activeView === "degrees"
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "hover:bg-gray-200 dark:hover:bg-gray-800"
            }`}
            >
            {collapsed ? "Deg" : "Degrees"}
            </button>

            <button
            onClick={() => setActiveView("semesters")}
            className={`px-3 py-2 rounded-lg text-left transition ${
                activeView === "semesters"
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "hover:bg-gray-200 dark:hover:bg-gray-800"
            }`}
            >
            {collapsed ? "Sem" : "Semesters"}
            </button>
            
            <button
            onClick={() => setActiveView("subjects")}
            className={`px-3 py-2 rounded-lg text-left transition ${
                activeView === "subjects"
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "hover:bg-gray-200 dark:hover:bg-gray-800"
            }`}
            >
            {collapsed ? "Sub" : "Subjects"}
            </button>

        </nav>
        </div>

        {/* Content */}
        <div className="flex-1 px-8">
        {renderContent()}
        </div>
    </div>
    );
}