import { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, User, RotateCcw, Menu, AlertTriangle, ShoppingCart, Hammer } from 'lucide-react';
import { useStore, demoUsers, roleLabels } from '../../store/useStore';
import { clsx } from '../../utils/format';
import { useLocation, useNavigate } from 'react-router-dom';
import { navItems } from './Sidebar';

const pageTitles: Record<string, string> = {
  '/': 'Asosiy ko\'rsatkichlar',
  '/pos': 'Kassa – POS',
  '/sales': 'Sotuvlar',
  '/products': 'Mahsulotlar',
  '/categories': 'Kategoriyalar',
  '/warehouse': 'Tovarlar harakati',
  '/inventory': 'Inventarizatsiya',
  '/purchases': 'Xaridlar',
  '/suppliers': "Ta'minlovchilar",
  '/customers': 'Mijozlar',
  '/employees': 'Xodimlar',
  '/reports': 'Hisobotlar va Statistika',
  '/settings': 'Boshqaruv va Sozlamalar',
};

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { currentUser, setCurrentUser, products, branches, resetDemoData, showToast } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  const [showUser, setShowUser] = useState(false);
  const [showBranch, setShowBranch] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowUser(false);
        setShowBranch(false);
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= p.minStock);
  const outOfStockProducts = products.filter(p => p.stock === 0);
  const alertProducts = [...outOfStockProducts, ...lowStockProducts];

  const title = pageTitles[location.pathname] || 'Mahsulotlar';

  const handleRoleSwitch = (user: typeof demoUsers[0]) => {
    setCurrentUser({ ...user, branch: currentUser.branch });
    setShowUser(false);
    showToast('info', `Rol almashtirildi: ${user.name} (${roleLabels[user.role]})`);
    const currentNav = navItems.find(n => n.path === location.pathname);
    if (currentNav && !currentNav.roles.includes(user.role)) {
      navigate('/');
    }
  };

  return (
    <header ref={dropdownRef} className="h-14 bg-white border-b border-gray-200 flex items-center px-5 gap-4 flex-shrink-0 z-30">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
        aria-label="Menyuni ochish"
      >
        <Menu size={20} />
      </button>

      {/* Page Title (Optimo bold left header) */}
      <h1 className="font-bold text-gray-900 text-lg tracking-tight">{title}</h1>

      <div className="flex items-center gap-3 ml-auto">
        {/* Quick Open POS Button */}
        <button
          onClick={() => navigate('/pos')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors cursor-pointer"
        >
          <ShoppingCart size={14} />
          <span>POS Kassa</span>
        </button>

        {/* Branch selector ("Asosiy v" like Optimo Screenshot 5) */}
        <div className="relative">
          <button
            onClick={() => { setShowBranch(!showBranch); setShowUser(false); setShowNotif(false); }}
            className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-gray-900 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer font-medium"
          >
            <span className="max-w-40 truncate">
              {currentUser.branch.includes('Asosiy') ? 'Asosiy' : currentUser.branch}
            </span>
            <ChevronDown size={15} className="text-gray-500" />
          </button>
          {showBranch && (
            <div className="absolute right-0 top-full mt-1.5 w-60 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-50">
              <p className="px-3 py-1 text-[11px] font-semibold text-gray-400 uppercase">Filialni tanlang</p>
              {branches.filter(b => b.active).map(b => (
                <button
                  key={b.id}
                  onClick={() => {
                    setCurrentUser({ ...currentUser, branch: b.name });
                    setShowBranch(false);
                    showToast('info', `Faol filial: ${b.name}`);
                  }}
                  className={clsx(
                    'w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between cursor-pointer',
                    currentUser.branch === b.name && 'text-indigo-600 font-semibold bg-indigo-50/50',
                  )}
                >
                  <span>{b.name}</span>
                  {currentUser.branch === b.name && <span className="w-2 h-2 rounded-full bg-indigo-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => { setShowNotif(!showNotif); setShowUser(false); setShowBranch(false); }}
            className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
            title="Bildirishnomalar"
          >
            <Bell size={18} />
            {alertProducts.length > 0 && (
              <span className="absolute top-1 right-1 min-w-4 h-4 px-1 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                {alertProducts.length}
              </span>
            )}
          </button>
          {showNotif && (
            <div className="absolute right-0 top-full mt-1.5 w-80 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                <span className="font-semibold text-sm text-gray-900">Ombor ogohlantirishlari</span>
                <span className="text-xs text-red-600 font-medium">{alertProducts.length} ta</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                {alertProducts.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">Yangi bildirishnomalar yo'q</p>
                ) : (
                  alertProducts.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { navigate('/products'); setShowNotif(false); }}
                      className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-start gap-2.5 cursor-pointer"
                    >
                      <AlertTriangle size={16} className={p.stock === 0 ? 'text-red-500 mt-0.5 shrink-0' : 'text-amber-500 mt-0.5 shrink-0'} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                        <p className="text-xs text-gray-500">
                          {p.stock === 0 ? 'Zaxirada tugagan!' : `Kam qoldi: ${p.stock} ${p.unit} (min: ${p.minStock})`}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Organization & Role Switcher ("O* OOO ' TEMIRCHI ' v" like Screenshot 5) */}
        <div className="relative">
          <button
            onClick={() => { setShowUser(!showUser); setShowBranch(false); setShowNotif(false); }}
            className="flex items-center gap-2.5 rounded-lg hover:bg-gray-100 px-2.5 py-1.5 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-slate-800 via-indigo-900 to-amber-700 rounded-lg flex items-center justify-center text-amber-400 flex-shrink-0 shadow-xs border border-amber-500/40">
              <Hammer size={15} className="-rotate-12" />
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-gray-800 tracking-wide">OOO " TEMIRCHI "</div>
              <div className="text-[11px] text-gray-500">{currentUser.name} ({roleLabels[currentUser.role]})</div>
            </div>
            <ChevronDown size={14} className="text-gray-500" />
          </button>

          {showUser && (
            <div className="absolute right-0 top-full mt-1.5 w-64 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs font-bold text-indigo-600">OOO " TEMIRCHI "</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">{currentUser.name}</p>
                <p className="text-xs text-gray-500">{roleLabels[currentUser.role]} · {currentUser.branch}</p>
              </div>
              <div className="px-2 py-2 border-b border-gray-100">
                <p className="text-[11px] font-semibold text-gray-400 uppercase px-2 mb-1">Demo rolni almashtirish</p>
                {demoUsers.map(u => (
                  <button
                    key={u.id}
                    onClick={() => handleRoleSwitch(u)}
                    className={clsx(
                      'w-full flex items-center gap-2 px-2.5 py-2 text-sm rounded-lg hover:bg-gray-50 transition-colors cursor-pointer',
                      currentUser.role === u.role && 'bg-indigo-50 text-indigo-600 font-semibold',
                    )}
                  >
                    <User size={14} />
                    <span>{u.name}</span>
                    <span className="ml-auto text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{roleLabels[u.role]}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  resetDemoData();
                  setShowUser(false);
                  showToast('success', "Demo ma'lumotlar boshlang'ich holatga qaytarildi");
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
              >
                <RotateCcw size={14} />
                <span>Demo ma'lumotlarni tiklash</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
