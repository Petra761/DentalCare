import React from 'react';
import { Link } from 'react-router-dom';
import { Smile, Sparkles, Shield, Award, Clock, MapPin, Phone, Star } from 'lucide-react';

export const Home: React.FC = () => {
  return (
    <div style={styles.page}>
      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div className="container" style={styles.heroGrid}>
          <div style={styles.heroContent} className="animate-fade-in">
            <div style={styles.badge}>
              <Sparkles size={16} color="var(--primary-600)" />
              <span>Clínica Dental Sonrisas Premium</span>
            </div>
            <h1 style={styles.heroTitle}>
              Tu Sonrisa, Nuestra <br />
              <span style={styles.highlightText}>Mayor Pasión</span>
            </h1>
            <p style={styles.heroDesc}>
              Ofrecemos cuidado dental excepcional para toda tu familia. Combinamos odontología avanzada con un trato cálido y personalizado para devolverte la confianza de sonreír.
            </p>
            <div style={styles.heroActions}>
              <Link to="/contacto" className="btn btn-primary">
                Reserva tu Cita
              </Link>
              <Link to="/servicios" className="btn btn-secondary">
                Ver Tratamientos
              </Link>
            </div>
          </div>
          <div style={styles.heroVisual} className="animate-float">
            {/* Elegant abstract illustration representing teeth / smile or clinic wellness using CSS */}
            <div style={styles.visualCard}>
              <div style={styles.visualCircle}>
                <Smile size={80} color="var(--primary-500)" />
              </div>
              <div style={styles.statsBox}>
                <Star size={18} color="#fbbf24" fill="#fbbf24" />
                <span style={styles.statsText}><strong>4.9/5</strong> (2,000+ Pacientes Satisfechos)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Info Cards */}
      <section style={styles.quickInfoSection}>
        <div className="container grid grid-3">
          <div className="card" style={styles.infoCard}>
            <div style={styles.iconWrapper}>
              <Clock size={24} color="var(--primary-600)" />
            </div>
            <h3 style={styles.infoTitle}>Horario Flexible</h3>
            <p style={styles.infoText}>Lunes a Viernes: 8 AM - 8 PM</p>
            <p style={styles.infoText}>Sábados: 9 AM - 2 PM</p>
          </div>
          
          <div className="card" style={styles.infoCard}>
            <div style={styles.iconWrapper}>
              <MapPin size={24} color="var(--primary-600)" />
            </div>
            <h3 style={styles.infoTitle}>Fácil Ubicación</h3>
            <p style={styles.infoText}>Av. Principal #123, Santo Domingo</p>
            <p style={styles.infoText}>Estacionamiento privado gratuito</p>
          </div>

          <div className="card" style={styles.infoCard}>
            <div style={styles.iconWrapper}>
              <Phone size={24} color="var(--primary-600)" />
            </div>
            <h3 style={styles.infoTitle}>Contacto Rápido</h3>
            <p style={styles.infoText}>+1 (809) 555-0199</p>
            <p style={styles.infoText}>contacto@dentacare.com.do</p>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section style={styles.whySection}>
        <div className="container">
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>¿Por qué Elegir DentaCare?</h2>
            <p style={styles.sectionSubtitle}>Nos esforzamos por brindar la mejor experiencia en odontología con un enfoque centrado en el bienestar del paciente.</p>
          </div>
          
          <div className="grid grid-3" style={{ marginTop: '3rem' }}>
            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>
                <Award size={24} color="white" />
              </div>
              <h4 style={styles.featureTitle}>Especialistas Certificados</h4>
              <p style={styles.featureDesc}>Nuestro equipo médico cuenta con posgrados y constante actualización en las últimas técnicas.</p>
            </div>

            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>
                <Shield size={24} color="white" />
              </div>
              <h4 style={styles.featureTitle}>Bioseguridad Garantizada</h4>
              <p style={styles.featureDesc}>Seguimos rigurosos protocolos internacionales de esterilización y control de infecciones.</p>
            </div>

            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>
                <Smile size={24} color="white" />
              </div>
              <h4 style={styles.featureTitle}>Enfoque Sin Dolor</h4>
              <p style={styles.featureDesc}>Utilizamos tecnología de anestesia moderna y técnicas de relajación para tu mayor confort.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Testimonials */}
      <section style={styles.testimonialsSection}>
        <div className="container">
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Lo Que Dicen Nuestros Pacientes</h2>
            <p style={styles.sectionSubtitle}>La satisfacción de quienes nos visitan es nuestra mejor carta de recomendación.</p>
          </div>
          
          <div className="grid grid-3" style={{ marginTop: '3rem' }}>
            <div className="card" style={styles.testimonialCard}>
              <div style={styles.stars}>
                {[...Array(5)].map((_, i) => <Star key={i} size={16} color="#fbbf24" fill="#fbbf24" />)}
              </div>
              <p style={styles.testimonialText}>
                "Excelente atención. Me realicé un diseño de sonrisa y el resultado superó mis expectativas. El trato del personal es sumamente profesional y amable."
              </p>
              <div style={styles.patientInfo}>
                <div style={styles.avatar}>CR</div>
                <div>
                  <h5 style={styles.patientName}>Carlos Rodríguez</h5>
                  <span style={styles.patientTrat}>Diseño de Sonrisa</span>
                </div>
              </div>
            </div>

            <div className="card" style={styles.testimonialCard}>
              <div style={styles.stars}>
                {[...Array(5)].map((_, i) => <Star key={i} size={16} color="#fbbf24" fill="#fbbf24" />)}
              </div>
              <p style={styles.testimonialText}>
                "Le tenía pánico al dentista, pero en esta clínica el trato fue tan delicado y sin dolor que me sentí completamente segura. Muy recomendados."
              </p>
              <div style={styles.patientInfo}>
                <div style={styles.avatar}>AL</div>
                <div>
                  <h5 style={styles.patientName}>Ana Ledesma</h5>
                  <span style={styles.patientTrat}>Odontología General</span>
                </div>
              </div>
            </div>

            <div className="card" style={styles.testimonialCard}>
              <div style={styles.stars}>
                {[...Array(5)].map((_, i) => <Star key={i} size={16} color="#fbbf24" fill="#fbbf24" />)}
              </div>
              <p style={styles.testimonialText}>
                "Llevé a mis hijos por primera vez y salieron felices. Tienen una paciencia increíble con los niños y las instalaciones son sumamente modernas."
              </p>
              <div style={styles.patientInfo}>
                <div style={styles.avatar}>MG</div>
                <div>
                  <h5 style={styles.patientName}>Miguel Gómez</h5>
                  <span style={styles.patientTrat}>Odontopediatría</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <div className="container" style={styles.ctaBox}>
          <h2 style={styles.ctaTitle}>¿Listo para una Sonrisa Más Sana y Brillante?</h2>
          <p style={styles.ctaDesc}>Agenda tu cita de valoración inicial hoy mismo y da el primer paso hacia una salud bucal perfecta.</p>
          <Link to="/contacto" className="btn btn-accent btn-lg" style={{ marginTop: '1rem' }}>
            Agendar Mi Cita Ahora
          </Link>
        </div>
      </section>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  heroSection: {
    background: 'radial-gradient(circle at 10% 20%, rgba(20, 184, 166, 0.05) 0%, rgba(99, 102, 241, 0.02) 90%)',
    padding: '6rem 0 4rem 0',
  },
  heroGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    alignItems: 'center',
    gap: '3rem',
  },
  heroContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    textAlign: 'left',
  },
  badge: {
    alignSelf: 'flex-start',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    color: 'var(--primary-700)',
    padding: '0.4rem 1rem',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  heroTitle: {
    fontSize: '3.5rem',
    lineHeight: '1.15',
    color: 'var(--text-primary)',
  },
  highlightText: {
    background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroDesc: {
    fontSize: '1.1rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    maxWidth: '540px',
  },
  heroActions: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  heroVisual: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  visualCard: {
    width: '320px',
    height: '320px',
    borderRadius: 'var(--radius-xl)',
    background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.08), rgba(99, 102, 241, 0.08))',
    border: '2px dashed var(--primary-300)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    boxShadow: 'var(--card-shadow)',
  },
  visualCircle: {
    width: '140px',
    height: '140px',
    borderRadius: '50%',
    backgroundColor: 'var(--bg-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 25px rgba(20, 184, 166, 0.15)',
  },
  statsBox: {
    position: 'absolute',
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-full)',
    padding: '0.5rem 1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    whiteSpace: 'nowrap',
  },
  statsText: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
  },
  quickInfoSection: {
    padding: '2rem 0 4rem 0',
  },
  infoCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '2.5rem 2rem',
  },
  iconWrapper: {
    width: '3.5rem',
    height: '3.5rem',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-50)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.25rem',
  },
  infoTitle: {
    fontSize: '1.2rem',
    fontWeight: 700,
    marginBottom: '0.5rem',
    color: 'var(--text-primary)',
  },
  infoText: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
  },
  whySection: {
    padding: '5rem 0',
    backgroundColor: 'var(--bg-secondary)',
  },
  sectionHeader: {
    textAlign: 'center',
    maxWidth: '640px',
    margin: '0 auto',
  },
  sectionTitle: {
    fontSize: '2.25rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '1rem',
  },
  sectionSubtitle: {
    color: 'var(--text-secondary)',
  },
  featureItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '1.5rem',
  },
  featureIcon: {
    width: '3.5rem',
    height: '3.5rem',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--primary-600)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.25rem',
    boxShadow: '0 8px 16px rgba(13, 148, 136, 0.3)',
  },
  featureTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    marginBottom: '0.75rem',
  },
  featureDesc: {
    fontSize: '0.95rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
  },
  testimonialsSection: {
    padding: '5rem 0',
  },
  testimonialCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    textAlign: 'left',
    padding: '2.5rem 2rem',
  },
  stars: {
    display: 'flex',
    gap: '0.25rem',
  },
  testimonialText: {
    fontSize: '0.95rem',
    color: 'var(--text-secondary)',
    fontStyle: 'italic',
    lineHeight: '1.6',
    flexGrow: 1,
  },
  patientInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1rem',
  },
  avatar: {
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-100)',
    color: 'var(--primary-700)',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.9rem',
  },
  patientName: {
    fontSize: '0.95rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  patientTrat: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
  },
  ctaSection: {
    padding: '4rem 0 6rem 0',
  },
  ctaBox: {
    background: 'linear-gradient(135deg, var(--primary-700), var(--primary-900))',
    color: 'white',
    borderRadius: 'var(--radius-lg)',
    padding: '4rem 2rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
    boxShadow: '0 20px 40px rgba(15, 118, 110, 0.25)',
  },
  ctaTitle: {
    fontSize: '2.5rem',
    color: 'white',
    maxWidth: '700px',
  },
  ctaDesc: {
    color: 'var(--primary-100)',
    fontSize: '1.1rem',
    maxWidth: '540px',
  }
};
