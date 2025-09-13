import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { menuSections } from '../../utils/menuData';
import { ChevronDown, ChevronRight, Factory, LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import * as LucideIcons from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false }) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['Administração']);
  const location = useLocation();
  const { user, logout } = useAuth();

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionTitle)
        ? prev.filter(title => title !== sectionTitle)
        : [...prev, sectionTitle]
    );
  };

  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent className="h-4 w-4" /> : <div className="h-4 w-4" />;
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={cn(
      "bg-gray-900 text-white h-screen flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <Factory className="h-8 w-8 text-primary-400" />
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold">GesProduçao</h1>
              <p className="text-xs text-gray-400">Tinturaria & Estamparia</p>
            </div>
          )}
        </div>
      </div>

      {/* User Info */}
      {!collapsed && user && (
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.username}</p>
              <p className="text-xs text-gray-400">{user.role}</p>
              {user.isAdmin && (
                <span className="inline-block px-2 py-1 text-xs bg-green-600 rounded-full mt-1">
                  Admin
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-2 px-2">
          {menuSections.map((section) => {
            const isExpanded = expandedSections.includes(section.title);
            const hasActiveItem = section.items.some(item => isActivePath(item.path));
            
            // Filtrar seções de administração se não for admin
            if (section.title === 'Administração' && (!user?.isAdmin)) {
              return null;
            }

            return (
              <div key={section.title}>
                {/* Section Header */}
                <button
                  onClick={() => !collapsed && toggleSection(section.title)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    hasActiveItem 
                      ? "bg-primary-600 text-white" 
                      : "text-gray-300 hover:bg-gray-800 hover:text-white",
                    collapsed && "justify-center"
                  )}
                >
                  <div className="flex items-center space-x-2">
                    {getIcon(section.items[0]?.icon || 'Folder')}
                    {!collapsed && <span>{section.title}</span>}
                  </div>
                  {!collapsed && (
                    <div className="ml-2">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </div>
                  )}
                </button>

                {/* Section Items */}
                {(!collapsed && isExpanded) && (
                  <div className="ml-4 mt-1 space-y-1">
                    {section.items.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                          "flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-colors",
                          isActivePath(item.path)
                            ? "bg-primary-700 text-white"
                            : "text-gray-400 hover:bg-gray-800 hover:text-white"
                        )}
                      >
                        {getIcon(item.icon || 'Circle')}
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </div>
  );
};