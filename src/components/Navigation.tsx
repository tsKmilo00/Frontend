import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';

export const Navigation: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleToggleNav = () => setIsNavCollapsed(!isNavCollapsed);
  const handleToggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const handleCloseNav = () => {
    setIsNavCollapsed(true);
    setIsDropdownOpen(false);
  };

  const handleLogout = async () => {
    handleCloseNav();
    await logout();
    navigate('/login');
  };

  if (!isAuthenticated || !user) return null;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark-gradient shadow-sm py-3">
      <div className="container">
        <Link className="navbar-brand fw-bold fs-4 d-flex align-items-center" to="/dashboard" onClick={handleCloseNav}>
          <span className="brand-logo-dot me-2"></span>
          PLATAFORMA
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          onClick={handleToggleNav}
          aria-controls="navbarNav"
          aria-expanded={!isNavCollapsed}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`collapse navbar-collapse ${isNavCollapsed ? '' : 'show'}`} id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active fw-semibold' : ''}`} to="/dashboard" onClick={handleCloseNav}>
                Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active fw-semibold' : ''}`} to="/profile" onClick={handleCloseNav}>
                Mi Perfil
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active fw-semibold' : ''}`} to="/manage-role" onClick={handleCloseNav}>
                Solicitar Rol
              </NavLink>
            </li>
            {user.rol === 'administrador' && (
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active fw-semibold' : ''}`} to="/admin" onClick={handleCloseNav}>
                  Panel Admin 🛡️
                </NavLink>
              </li>
            )}
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active fw-semibold' : ''}`} to="/reports" onClick={handleCloseNav}>
                Reportes
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link d-flex align-items-center ${isActive ? 'active fw-semibold' : ''}`} to="/notifications" onClick={handleCloseNav}>
                Notificaciones
                {unreadCount > 0 && (
                  <span className="badge bg-danger rounded-pill ms-2 animate-bounce" style={{ fontSize: '0.75rem' }}>
                    {unreadCount}
                  </span>
                )}
              </NavLink>
            </li>
          </ul>
          <div className="navbar-nav align-items-lg-center">
            <div className={`nav-item dropdown ${isDropdownOpen ? 'show' : ''}`} style={{ position: 'relative' }}>
              <button
                className="btn btn-link nav-link dropdown-toggle d-flex align-items-center text-white border-0 bg-transparent text-start"
                onClick={handleToggleDropdown}
                aria-expanded={isDropdownOpen}
              >
                <div 
                  className="avatar-circle me-2 bg-gradient-primary text-white fw-bold d-flex align-items-center justify-content-center"
                  style={{ width: '36px', height: '36px', borderRadius: '50%' }}
                >
                  {user.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="d-block fw-semibold" style={{ fontSize: '0.9rem', lineHeight: '1.2' }}>{user.nombre}</span>
                  <span className="badge bg-primary text-uppercase" style={{ fontSize: '0.65rem', padding: '0.2em 0.6em' }}>
                    {user.rol}
                  </span>
                </div>
              </button>
              <ul 
                className={`dropdown-menu dropdown-menu-end shadow border-0 mt-2 ${isDropdownOpen ? 'show' : ''}`} 
                style={{ 
                  position: isNavCollapsed ? 'absolute' : 'static', 
                  right: 0,
                  display: isDropdownOpen ? 'block' : 'none',
                  borderRadius: '10px'
                }}
              >
                <li>
                  <Link className="dropdown-item py-2" to="/profile" onClick={handleCloseNav}>
                    👤 Mi Perfil
                  </Link>
                </li>
                {user.rol === 'administrador' && (
                  <li>
                    <Link className="dropdown-item py-2 fw-semibold text-danger" to="/admin" onClick={handleCloseNav}>
                      🛡️ Panel Admin
                    </Link>
                  </li>
                )}
                <li>
                  <Link className="dropdown-item py-2" to="/notifications" onClick={handleCloseNav}>
                    🔔 Notificaciones
                    {unreadCount > 0 && <span className="badge bg-danger ms-2">{unreadCount}</span>}
                  </Link>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item text-danger py-2" onClick={handleLogout}>
                    🚪 Cerrar Sesión
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
