import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Phone, Mail, MapPin, Clock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer style={styles.footer}>
      <div className="container" style={styles.container}>
        <div style={styles.grid}>
          {/* Brand Column */}
          <div style={styles.column}>
            <div style={styles.brand}>
              <div style={styles.logoCircle}>
                <Stethoscope size={20} color="#ffffff" />
              </div>
              <span style={styles.brandText}>DentaCare</span>
            </div>
            <p style={styles.description}>
              Ofrecemos servicios odontológicos integrales de alta calidad con tecnología de vanguardia y un equipo humano altamente calificado.
            </p>
            <div style={styles.socials}>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
            </div>
          </div>

          {/* Links Column */}
          <div style={styles.column}>
            <h4 style={styles.heading}>Enlaces Rápidos</h4>
            <ul style={styles.list}>
              <li><Link to="/" style={styles.link}>Inicio</Link></li>
              <li><Link to="/servicios" style={styles.link}>Nuestros Servicios</Link></li>
              <li><Link to="/nosotros" style={styles.link}>Sobre Nosotros</Link></li>
              <li><Link to="/contacto" style={styles.link}>Contacto</Link></li>
            </ul>
          </div>

          {/* Hours Column */}
          <div style={styles.column}>
            <h4 style={styles.heading}>Horario de Atención</h4>
            <ul style={styles.list}>
              <li style={styles.hoursItem}>
                <Clock size={16} color="var(--primary-500)" />
                <div>
                  <strong>Lunes a Viernes:</strong>
                  <span style={styles.blockText}>08:00 AM - 08:00 PM</span>
                </div>
              </li>
              <li style={styles.hoursItem}>
                <Clock size={16} color="var(--primary-500)" />
                <div>
                  <strong>Sábados:</strong>
                  <span style={styles.blockText}>09:00 AM - 02:00 PM</span>
                </div>
              </li>
              <li style={styles.hoursItem}>
                <Clock size={16} color="var(--primary-500)" />
                <div>
                  <strong>Domingos:</strong>
                  <span style={styles.blockText}>Cerrado (Solo Emergencias)</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div style={styles.column}>
            <h4 style={styles.heading}>Contacto</h4>
            <ul style={styles.list}>
              <li style={styles.contactItem}>
                <MapPin size={20} color="var(--primary-500)" style={{ flexShrink: 0 }} />
                <span>Av. Principal #123, Zona Dental, Santo Domingo</span>
              </li>
              <li style={styles.contactItem}>
                <Phone size={18} color="var(--primary-500)" style={{ flexShrink: 0 }} />
                <span>+1 (809) 555-0199</span>
              </li>
              <li style={styles.contactItem}>
                <Mail size={18} color="var(--primary-500)" style={{ flexShrink: 0 }} />
                <span>contacto@dentacare.com.do</span>
              </li>
            </ul>
          </div>
        </div>

        <div style={styles.bottom}>
          <p>© {new Date().getFullYear()} DentaCare. Todos los derechos reservados. Desarrollado con pasión para tu sonrisa.</p>
        </div>
      </div>
    </footer>
  );
};

const styles: Record<string, React.CSSProperties> = {
  footer: {
    backgroundColor: 'var(--bg-secondary)',
    borderTop: '1px solid var(--border-color)',
    padding: '4rem 0 2rem 0',
    marginTop: 'auto',
    transition: 'background-color var(--transition-normal), border-color var(--transition-normal)',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '2.5rem',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  logoCircle: {
    width: '2rem',
    height: '2rem',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-600)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.25rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
  },
  description: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
  },
  socials: {
    display: 'flex',
    gap: '1rem',
  },
  socialLink: {
    width: '2.25rem',
    height: '2.25rem',
    borderRadius: '50%',
    backgroundColor: 'var(--bg-tertiary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary)',
    transition: 'all var(--transition-fast)',
  },
  heading: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    borderBottom: '2px solid var(--primary-200)',
    paddingBottom: '0.5rem',
    display: 'inline-block',
    alignSelf: 'flex-start',
  },
  list: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    padding: 0,
    margin: 0,
  },
  link: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
  },
  hoursItem: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'flex-start',
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
  },
  blockText: {
    display: 'block',
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
  },
  contactItem: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'flex-start',
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
  },
  bottom: {
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1.5rem',
    textAlign: 'center',
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
  }
};
