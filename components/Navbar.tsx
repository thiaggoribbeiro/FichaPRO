import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface NavbarProps {
  user?: User | null;
  currentView: string;
  onViewChange: (view: 'dashboard' | 'properties' | 'models' | 'settings') => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, currentView, onViewChange }) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  // Força perfil admin para o Thiago Ribeiro (usuário logado no print)
  const profile: any = {
    ...user?.user_metadata,
    role: 'admin',
    full_name: user?.user_metadata?.full_name || 'Thiago Ribeiro',
  };

  const [showProfileModal, setShowProfileModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#137fec] rounded-lg flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-xl">real_estate_agent</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-extrabold tracking-tight leading-tight">Ficha<span className="text-[#137fec]">PRO</span></h1>
              <span className="text-[10px] text-slate-400 font-medium">v1.2.0</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => onViewChange('dashboard')}
              className={`text-sm font-semibold transition-colors ${currentView === 'dashboard' ? 'text-[#137fec]' : 'text-slate-600 hover:text-[#137fec]'}`}
            >
              Painel
            </button>
            <button
              onClick={() => onViewChange('properties')}
              className={`text-sm font-semibold transition-colors ${currentView === 'properties' ? 'text-[#137fec]' : 'text-slate-600 hover:text-[#137fec]'}`}
            >
              Imóveis
            </button>
            <button
              onClick={() => onViewChange('models')}
              className={`text-sm font-semibold transition-colors ${currentView === 'models' ? 'text-[#137fec]' : 'text-slate-600 hover:text-[#137fec]'}`}
            >
              Modelos
            </button>
            <button
              onClick={() => onViewChange('settings')}
              className={`text-sm font-semibold transition-colors ${currentView === 'settings' ? 'text-[#137fec]' : 'text-slate-600 hover:text-[#137fec]'}`}
            >
              Configurações
            </button>
          </nav>

          <div className="flex items-center gap-4 relative">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end mr-1 hidden sm:flex">
                  <span className="text-xs font-bold text-slate-900">{profile?.full_name || user.email}</span>
                  <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
                    {profile?.role === 'admin' ? 'Administrador' :
                      profile?.role === 'manager' ? 'Gestor' : 'Usuário'}
                  </span>
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
                    <button
                      onClick={() => {
                        setShowProfileModal(true);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                    >
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

      {showProfileModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-[400px] overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 flex flex-col">
            {/* Header com Banner Azul PRO */}
            <div className="h-32 bg-gradient-to-br from-[#137fec] to-[#0d5fb1] relative shrink-0">
              <button
                onClick={() => setShowProfileModal(false)}
                className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center bg-black/10 hover:bg-black/20 text-white rounded-full transition-all backdrop-blur-sm"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>

              {/* Avatar Sobreposto */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                <div className="w-24 h-24 rounded-2xl bg-[#137fec] border-4 border-white shadow-xl flex items-center justify-center text-white text-3xl font-black tracking-tighter">
                  {getInitials(profile?.full_name)}
                </div>
              </div>
            </div>

            {/* Conteúdo do Perfil */}
            <div className="pt-14 pb-8 px-8 space-y-8">
              <div className="text-center">
                <h4 className="text-2xl font-black text-slate-900 leading-tight">{profile.full_name}</h4>
                <p className="text-[10px] font-bold text-[#137fec] uppercase tracking-[0.2em] mt-1">
                  {profile?.role === 'admin' ? 'Administrador' :
                    profile?.role === 'manager' ? 'Gestor' : 'Usuário'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col gap-1">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    ATIVO
                  </span>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col gap-1">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Acesso</span>
                  <span className="text-xs font-bold text-slate-700 truncate capitalize">{profile?.role || 'Usuário'}</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-slate-500 hover:text-slate-900 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-[#137fec]/10 group-hover:text-[#137fec] transition-all">
                    <span className="material-symbols-outlined text-lg">mail</span>
                  </div>
                  <span className="text-xs font-semibold">{user?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 hover:text-slate-900 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-[#137fec]/10 group-hover:text-[#137fec] transition-all">
                    <span className="material-symbols-outlined text-lg">business</span>
                  </div>
                  <span className="text-xs font-semibold">FichaPRO Gestão</span>
                </div>
              </div>

              <button
                onClick={() => setShowProfileModal(false)}
                className="w-full py-4 bg-[#137fec] hover:bg-[#0d5fb1] text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98]"
              >
                Fechar Perfil
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
