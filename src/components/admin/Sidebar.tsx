"use client"

import { useState } from "react"
import { Users, BarChart2, Settings } from "lucide-react"

const sidebarItems = [
  { label: "Users", icon: Users },
  { label: "Analytics", icon: BarChart2 },
  { label: "Settings", icon: Settings },
]

export default function Sidebar() {
  const [activeTab, setActiveTab] = useState("Users")

  return (
    <aside className="w-64 bg-white shadow-md h-[calc(100vh-4rem)] fixed">
      <ul className="py-4">
        {sidebarItems.map((item) => (
          <li
            key={item.label}
            className={`flex items-center px-6 py-3 cursor-pointer transition-colors duration-200 ${
              activeTab === item.label ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab(item.label)}
          >
            <item.icon className="mr-3 h-5 w-5" />
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </aside>
  )
}

