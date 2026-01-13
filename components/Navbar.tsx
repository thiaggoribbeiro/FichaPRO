import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface NavbarProps {
  user?: User | null;
}

const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const profile = user?.user_metadata;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#137fec] rounded-lg flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-xl">real_estate_agent</span>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight">PropSheet<span className="text-[#137fec]">Pro</span></h1>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <a className="text-sm font-semibold text-[#137fec]" href="#">Painel</a>
          <a className="text-sm font-medium text-slate-600 hover:text-[#137fec] transition-colors" href="#">Imóveis</a>
          <a className="text-sm font-medium text-slate-600 hover:text-[#137fec] transition-colors" href="#">Modelos</a>
          <a className="text-sm font-medium text-slate-600 hover:text-[#137fec] transition-colors" href="#">Configurações</a>
        </nav>

        <div className="flex items-center gap-4 relative">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end mr-1 hidden sm:flex">
                <span className="text-xs font-bold text-slate-900">{profile?.full_name || user.email}</span>
                <span className="text-[10px] text-slate-500 font-medium">Corretor Premium</span>
              </div>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-10 h-10 rounded-full border-2 border-[#137fec]/20 bg-[#137fec]/10 flex items-center justify-center text-[#137fec] font-bold overflow-hidden hover:border-[#137fec]/40 transition-all"
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{getInitials(profile?.full_name)}</span>
                )}
              </button>

              {showMenu && (
                <div className="absolute right-0 top-12 w-48 bg-white border border-slate-100 rounded-xl shadow-xl shadow-slate-200/50 py-2 z-[60] animate-in fade-in slide-in-from-top-2">
                  <button className="w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">person</span>
                    Perfil
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">settings</span>
                    Configurações
                  </button>
                  <hr className="my-2 border-slate-100" />
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">logout</span>
                    Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-slate-100 animate-pulse"></div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
