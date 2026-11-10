import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home, ShoppingCart, Receipt, Package, Truck, Users, UserCog,
  BarChart3, Settings, Menu, X, ChevronDown, ChevronRight, LogIn, Hammer
} from 'lucide-react';
import { clsx } from '../../utils/format';
import { useStore } from '../../store/useStore';
import type { UserRole } from '../../types';

export interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

export const navItems: NavItem[] = [
  { path: '/', label: 'Asosiy', icon: <Home size={18} />, roles: ['admin', 'menejer', 'kassir', 'omborchi'] },
  { path: '/pos', label: 'Kassa (POS)', icon: <ShoppingCart size={18} />, roles: ['admin', 'menejer', 'kassir'] },
  { path: '/products', label: 'Mahsulotlar', icon: <Package size={18} />, roles: ['admin', 'menejer', 'omborchi'] },
  { path: '/categories', label: 'Kategoriyalar', icon: <Package size={18} />, roles: ['admin', 'menejer'] },
  { path: '/warehouse', label: 'Tovarlar harakati', icon: <Package size={18} />, roles: ['admin', 'menejer', 'omborchi'] },
  { path: '/inventory', label: 'Inventarizatsiya', icon: <Package size={18} />, roles: ['admin', 'menejer', 'omborchi'] },
  { path: '/suppliers', label: "Ta'minlovchilar", icon: <Truck size={18} />, roles: ['admin', 'menejer'] },
  { path: '/purchases', label: 'Xaridlar', icon: <LogIn size={18} />, roles: ['admin', 'menejer', 'omborchi'] },
  { path: '/sales', label: 'Sotuvlar', icon: <Receipt size={18} />, roles: ['admin', 'menejer', 'kassir'] },
  { path: '/customers', label: 'Mijozlar', icon: <Users size={18} />, roles: ['admin', 'menejer', 'kassir'] },
  { path: '/reports', label: 'Hisobotlar', icon: <BarChart3 size={18} />, roles: ['admin', 'menejer'] },
  { path: '/employees', label: 'Xodimlar', icon: <UserCog size={18} />, roles: ['admin'] },
  { path: '/settings', label: 'Boshqaruv', icon: <Settings size={18} />, roles: ['admin'] },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const { currentUser } = useStore();
  const location = useLocation();

  const isProductsGroupActive = ['/products', '/categories', '/warehouse', '/inventory'].includes(location.pathname);
  const [productsExpanded, setProductsExpanded] = useState(true);

  const canSee = (roles: UserRole[]) => roles.includes(currentUser.role);

  const sidebarContent = (isMobile: boolean) => (
    <aside
      className={clsx(
        'h-screen bg-[#f8f9fc] border-r border-gray-200 flex flex-col transition-all duration-200 ease-in-out flex-shrink-0 select-none',
        isMobile ? 'w-64' : collapsed ? 'w-16' : 'w-60',
      )}
    >
      {/* Optimo Logo Header */}
      <div className={clsx('flex items-center gap-3 px-4 h-14 border-b border-gray-200/80 bg-white', !isMobile && collapsed ? 'justify-center px-0' : '')}>
        {!isMobile && (
          <button
            onClick={onToggle}
            className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg cursor-pointer"
            title="Menyuni yig'ish / ochish"
          >
            <Menu size={18} />
          </button>
        )}

        {(isMobile || !collapsed) && (
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-800 via-indigo-900 to-amber-700 flex items-center justify-center shadow-xs border border-amber-500/40 shrink-0">
              <Hammer size={17} className="text-amber-400 -rotate-12" />
            </div>
            <div className="leading-none truncate">
              <span className="font-extrabold text-base tracking-wider text-[#1e1b4b] block truncate">
                TEMIRCHI
              </span>
              <span className="text-[10px] font-semibold text-amber-700 tracking-wide">
                METALLOBAZA
              </span>
            </div>
          </div>
        )}

        {isMobile && onMobileClose && (
          <button onClick={onMobileClose} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Prominent POS Launch Button */}
      {canSee(['admin', 'menejer', 'kassir']) && (
        <div className="px-3 pt-3 pb-1">
          <NavLink
            to="/pos"
            onClick={() => isMobile && onMobileClose?.()}
            className={clsx(
              'flex items-center gap-2.5 rounded-lg bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold text-sm py-2.5 px-3 shadow-xs transition-colors',
              !isMobile && collapsed ? 'justify-center px-0' : '',
            )}
            title="Kassa (POS) terminalini ochish"
          >
            <ShoppingCart size={17} className="shrink-0" />
            {(isMobile || !collapsed) && <span>Kassa (POS Terminal)</span>}
          </NavLink>
        </div>
      )}

      {/* Navigation List (Optimo Dashboard Style) */}
      <nav className="flex-1 overflow-y-auto py-2 space-y-0.5 px-2 text-[13px]">
        {/* Asosiy */}
        <NavLink
          to="/"
          end
          onClick={() => isMobile && onMobileClose?.()}
          className={({ isActive }) =>
            clsx(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-colors',
              isActive
                ? 'bg-[#e8eaf6] text-[#3f51b5] font-semibold'
                : 'text-gray-700 hover:bg-gray-200/60',
              !isMobile && collapsed ? 'justify-center px-0' : '',
            )
          }
        >
          <Home size={17} className="shrink-0" />
          {(isMobile || !collapsed) && <span>Asosiy</span>}
        </NavLink>

        {/* Mahsulotlar Expandable Group */}
        {canSee(['admin', 'menejer', 'omborchi']) && (
          <div>
            <button
              type="button"
              onClick={() => setProductsExpanded(!productsExpanded)}
              className={clsx(
                'w-full flex items-center justify-between rounded-lg px-3 py-2.5 font-medium transition-colors cursor-pointer',
                isProductsGroupActive ? 'text-gray-900 font-semibold bg-gray-200/50' : 'text-gray-700 hover:bg-gray-200/60',
                !isMobile && collapsed ? 'justify-center px-0' : '',
              )}
            >
              <span className="flex items-center gap-3">
                <Package size={17} className="shrink-0" />
                {(isMobile || !collapsed) && <span>Mahsulotlar</span>}
              </span>
              {(isMobile || !collapsed) && (
                productsExpanded ? <ChevronDown size={15} className="text-gray-500" /> : <ChevronRight size={15} className="text-gray-500" />
              )}
            </button>

            {(productsExpanded || (!isMobile && collapsed)) && (
              <div className={clsx('mt-0.5 space-y-0.5', (isMobile || !collapsed) ? 'pl-6' : '')}>
                {[
                  { path: '/products', label: 'Mahsulotlar', roles: ['admin', 'menejer', 'omborchi'] as UserRole[] },
                  { path: '/categories', label: 'Kategoriyalar', roles: ['admin', 'menejer'] as UserRole[] },
                  { path: '/warehouse', label: 'Tovarlar harakati', roles: ['admin', 'menejer', 'omborchi'] as UserRole[] },
                  { path: '/inventory', label: 'Inventarizatsiya', roles: ['admin', 'menejer', 'omborchi'] as UserRole[] },
                ]
                  .filter(sub => canSee(sub.roles))
                  .map(sub => (
                    <NavLink
                      key={sub.path}
                      to={sub.path}
                      onClick={() => isMobile && onMobileClose?.()}
                      className={({ isActive }) =>
                        clsx(
                          'flex items-center gap-2 rounded-lg px-3 py-2 transition-colors',
                          isActive
                            ? 'bg-[#e8eaf6] text-[#3f51b5] font-semibold'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50',
                          !isMobile && collapsed ? 'justify-center px-0' : '',
                        )
                      }
                    >
                      {(isMobile || !collapsed) ? (
                        <span className="truncate">{sub.label}</span>
                      ) : (
                        <span className="text-[10px] font-bold">{sub.label.slice(0, 2)}</span>
                      )}
                    </NavLink>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Remaining top-level items matching Optimo sidebar */}
        {[
          { path: '/suppliers', label: "Ta'minlovchilar", icon: <Truck size={17} />, roles: ['admin', 'menejer'] as UserRole[] },
          { path: '/purchases', label: 'Xaridlar', icon: <LogIn size={17} />, roles: ['admin', 'menejer', 'omborchi'] as UserRole[] },
          { path: '/sales', label: 'Sotuvlar', icon: <Receipt size={17} />, roles: ['admin', 'menejer', 'kassir'] as UserRole[] },
          { path: '/customers', label: 'Mijozlar', icon: <Users size={17} />, roles: ['admin', 'menejer', 'kassir'] as UserRole[] },
          { path: '/reports', label: 'Hisobotlar va Statistika', icon: <BarChart3 size={17} />, roles: ['admin', 'menejer'] as UserRole[] },
          { path: '/employees', label: 'Xodimlar', icon: <UserCog size={17} />, roles: ['admin'] as UserRole[] },
          { path: '/settings', label: 'Boshqaruv', icon: <Settings size={17} />, roles: ['admin'] as UserRole[] },
        ]
          .filter(item => canSee(item.roles))
          .map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => isMobile && onMobileClose?.()}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-colors',
                  isActive
                    ? 'bg-[#e8eaf6] text-[#3f51b5] font-semibold'
                    : 'text-gray-700 hover:bg-gray-200/60',
                  !isMobile && collapsed ? 'justify-center px-0' : '',
                )
              }
              title={!isMobile && collapsed ? item.label : undefined}
            >
              <span className="shrink-0">{item.icon}</span>
              {(isMobile || !collapsed) && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
      </nav>
    </aside>
  );

  return (
    <>
      <div className="hidden lg:block">
        {sidebarContent(false)}
      </div>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={onMobileClose} />
          <div className="relative z-10">
            {sidebarContent(true)}
          </div>
        </div>
      )}
    </>
  );
}
