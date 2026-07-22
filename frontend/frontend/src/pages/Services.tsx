import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Activity, Sparkles, Smile, Shield, Layers, HelpCircle } from 'lucide-react';

interface ServiceItem {
  id: string;
  title: string;
  desc: string;
  duration: string;
  price: string;
  icon: React.ReactNode;
}

export const Services: React.FC = () => {
  const navigate = useNavigate();

  const servicesData: ServiceItem[] = [
    {
      id: 'general',
      title: 'Odontología General y Limpieza',
      desc: 'Revisiones rutinarias, eliminación de sarro, fluoración y empastes dentales. Mantén tu boca libre de caries y encías sanas.',
      duration: '45 - 60 minutos',
      price: '$50 - $100',
      icon: <Smile size={28} color="var(--primary-600)" />
    },
    {
      id: 'ortodoncia',
      title: 'Ortodoncia (Brackets e Invisalign)',
      desc: 'Corrección de la alineación dental y mordida. Ofrecemos brackets metálicos tradicionales, cerámicos estéticos y alineadores invisibles (Invisalign).',
      duration: '12 - 24 meses (tratamiento)',
      price: 'Desde $1,500',
      icon: <Layers size={28} color="var(--primary-600)" />
    },
    {
      id: 'implantes',
      title: 'Implantes y Prótesis Dentales',
      desc: 'Reemplazo permanente de dientes perdidos mediante raíces artificiales de titanio y coronas estéticas de zirconio que lucen naturales.',
      duration: '2 - 3 sesiones (proceso)',
      price: 'Desde $800 / diente',
      icon: <Activity size={28} color="var(--primary-600)" />
    },
    {
      id: 'estetica',
      title: 'Estética Dental y Blanqueamiento',
      desc: 'Diseño de sonrisa con carillas de porcelana o resina, y blanqueamiento dental profesional con luz LED para aclarar varios tonos en una sesión.',
      duration: '60 - 90 minutos',
      price: '$150 - $350',
      icon: <Sparkles size={28} color="var(--primary-600)" />
    },
    {
      id: 'odontopediatria',
      title: 'Odontopediatría (Atención Infantil)',
      desc: 'Especialistas con paciencia y técnicas lúdicas para el cuidado dental infantil, sellado de fisuras y educación en cepillado.',
      duration: '30 - 45 minutos',
      price: '$45 - $80',
      icon: <HelpCircle size={28} color="var(--primary-600)" />
    },
    {
      id: 'endodoncia',
      title: 'Endodoncia y Tratamiento de Conducto',
      desc: 'Tratamientos para salvar dientes gravemente dañados o infectados, eliminando el dolor del nervio y sellando el conducto.',
      duration: '60 - 90 minutos',
      price: '$200 - $400',
      icon: <Shield size={28} color="var(--primary-600)" />
    }
  ];

  const handleBook = (treatmentName: string) => {
    navigate('/contacto', { state: { treatment: treatmentName } });
  };

  return (
    <div style={styles.page}>
      {/* Header Banner */}
      <section style={styles.banner}>
        <div className="container">
          <h1 style={styles.bannerTitle}>Nuestros Servicios Odontológicos</h1>
          <p style={styles.bannerSubtitle}>Soluciones integrales de alta calidad para cuidar tu salud bucodental en cada etapa de la vida.</p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section">
        <div className="container">
          <div className="grid grid-3">
            {servicesData.map((service) => (
              <div className="card" key={service.id} style={styles.serviceCard}>
                <div style={styles.iconContainer}>
                  {service.icon}
                </div>
                <h3 style={styles.serviceTitle}>{service.title}</h3>
                <p style={styles.serviceDesc}>{service.desc}</p>
                
                <div style={styles.metaBox}>
                  <div style={styles.metaRow}>
                    <span style={styles.metaLabel}>Duración estimada:</span>
                    <span style={styles.metaValue}>{service.duration}</span>
                  </div>
                  <div style={styles.metaRow}>
                    <span style={styles.metaLabel}>Precio sugerido:</span>
                    <span style={styles.metaValue}><strong>{service.price}</strong></span>
                  </div>
                </div>

                <button 
                  onClick={() => handleBook(service.title)} 
                  className="btn btn-primary btn-sm" 
                  style={styles.bookBtn}
                >
                  Agendar este tratamiento
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Info Warning banner */}
      <section style={styles.infoSection}>
        <div className="container" style={styles.infoBox}>
          <ShieldAlert size={36} color="var(--primary-600)" style={{ flexShrink: 0 }} />
          <div>
            <h4 style={styles.infoBoxTitle}>Diagnóstico Personalizado Obligatorio</h4>
            <p style={styles.infoBoxText}>
              Los precios y duraciones listadas son estimaciones promedio. Cada boca es única y requiere un examen clínico completo y radiográfico antes de emitir un presupuesto definitivo.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    width: '100%',
  },
  banner: {
    background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.05) 0%, rgba(99, 102, 241, 0.03) 100%)',
    padding: '4rem 0',
    textAlign: 'center',
    borderBottom: '1px solid var(--border-color)',
  },
  bannerTitle: {
    fontSize: '2.5rem',
    marginBottom: '1rem',
  },
  bannerSubtitle: {
    color: 'var(--text-secondary)',
    fontSize: '1.1rem',
    maxWidth: '700px',
    margin: '0 auto',
  },
  serviceCard: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
    height: '100%',
  },
  iconContainer: {
    width: '3.5rem',
    height: '3.5rem',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--primary-50)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5rem',
  },
  serviceTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    marginBottom: '1rem',
    color: 'var(--text-primary)',
  },
  serviceDesc: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    marginBottom: '1.5rem',
    flexGrow: 1,
  },
  metaBox: {
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: 'var(--radius-sm)',
    padding: '1rem',
    marginBottom: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    border: '1px solid var(--border-color)',
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
  },
  metaLabel: {
    color: 'var(--text-muted)',
  },
  metaValue: {
    color: 'var(--text-primary)',
    fontWeight: 600,
  },
  bookBtn: {
    width: '100%',
  },
  infoSection: {
    padding: '0 0 5rem 0',
  },
  infoBox: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '2rem',
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
    textAlign: 'left',
    maxWidth: '800px',
    margin: '0 auto',
  },
  infoBoxTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    marginBottom: '0.25rem',
    color: 'var(--text-primary)',
  },
  infoBoxText: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
  }
};
