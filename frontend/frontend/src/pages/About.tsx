import React from 'react';
import { Award, ShieldCheck, Heart, Cpu } from 'lucide-react';

interface Dentist {
  name: string;
  role: string;
  specialty: string;
  bio: string;
  initials: string;
}

export const About: React.FC = () => {
  const dentists: Dentist[] = [
    {
      name: 'Dr. Alejandro García',
      role: 'Director Médico',
      specialty: 'Implantes Dentales y Cirugía Oral',
      bio: 'Graduado con honores, con más de 15 años de experiencia y posgrados en Alemania. Apasionado por devolver la función y estética dental.',
      initials: 'AG'
    },
    {
      name: 'Dra. Patricia Martínez',
      role: 'Especialista en Ortodoncia',
      specialty: 'Ortodoncia Avanzada e Invisalign',
      bio: 'Certificada en sistemas de alineación invisible modernos. Dedicada a crear sonrisas armónicas para niños y adultos.',
      initials: 'PM'
    },
    {
      name: 'Dr. Roberto López',
      role: 'Odontopediatra',
      specialty: 'Odontología Infantil y Prevención',
      bio: 'Con amplia carisma y empatía, especializado en hacer de la visita dental una experiencia divertida y educativa para los más pequeños.',
      initials: 'RL'
    }
  ];

  return (
    <div style={styles.page}>
      {/* Banner */}
      <section style={styles.banner}>
        <div className="container">
          <h1 style={styles.bannerTitle}>Sobre DentaCare</h1>
          <p style={styles.bannerSubtitle}>Conoce nuestra historia, valores y al equipo comprometido con el cuidado de tu salud bucal.</p>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="section">
        <div className="container grid grid-2" style={styles.philosophyGrid}>
          <div style={styles.philosophyContent}>
            <h2 style={styles.sectionHeading}>Cuidado Profesional Con Calidez Humana</h2>
            <p style={styles.paragraph}>
              Fundada en 2012, DentaCare nació con el propósito de transformar la experiencia odontológica. Creemos que la salud bucal no tiene que estar asociada al dolor o la ansiedad.
            </p>
            <p style={styles.paragraph}>
              Por eso, diseñamos un espacio confortable con tecnología de punta y capacitamos a nuestro equipo no solo en excelencia técnica, sino en empatía y comunicación con el paciente.
            </p>

            <div style={styles.statsRow}>
              <div style={styles.statBox}>
                <span style={styles.statNum}>14+</span>
                <span style={styles.statLabel}>Años de Experiencia</span>
              </div>
              <div style={styles.statBox}>
                <span style={styles.statNum}>5,000+</span>
                <span style={styles.statLabel}>Sonrisas Creadas</span>
              </div>
              <div style={styles.statBox}>
                <span style={styles.statNum}>99%</span>
                <span style={styles.statLabel}>Opiniones Positivas</span>
              </div>
            </div>
          </div>
          
          <div style={styles.philosophyVisual}>
            <div style={styles.missionCard}>
              <div style={styles.valueRow}>
                <div style={styles.valueIcon}><Heart size={20} color="var(--primary-600)" /></div>
                <div>
                  <h4 style={styles.valueTitle}>Misión</h4>
                  <p style={styles.valueText}>Brindar odontología integral de la más alta calidad en un ambiente seguro y relajante, garantizando el bienestar de nuestros pacientes.</p>
                </div>
              </div>

              <div style={styles.valueRow}>
                <div style={styles.valueIcon}><Award size={20} color="var(--primary-600)" /></div>
                <div>
                  <h4 style={styles.valueTitle}>Visión</h4>
                  <p style={styles.valueText}>Ser la clínica dental de referencia en el país por nuestra innovación tecnológica, ética profesional y excelencia en el servicio al cliente.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech/Innovation Banner */}
      <section className="section section-bg" style={styles.techSection}>
        <div className="container">
          <div style={styles.techHeader}>
            <Cpu size={40} color="var(--primary-600)" />
            <h2 style={styles.techTitle}>Tecnología que Marca la Diferencia</h2>
            <p style={styles.techDesc}>
              Nos equipamos con tecnología de vanguardia para ofrecer tratamientos más rápidos, precisos y menos invasivos:
            </p>
          </div>
          
          <div className="grid grid-3" style={{ marginTop: '2.5rem' }}>
            <div className="card" style={styles.techCard}>
              <ShieldCheck size={28} color="var(--primary-600)" style={{ marginBottom: '1rem' }} />
              <h4>Radiografía Digital 3D</h4>
              <p style={styles.techText}>Menor radiación que las placas tradicionales y visualización tridimensional completa para diagnósticos de precisión milimétrica.</p>
            </div>
            
            <div className="card" style={styles.techCard}>
              <ShieldCheck size={28} color="var(--primary-600)" style={{ marginBottom: '1rem' }} />
              <h4>Escáner Intraoral 3D</h4>
              <p style={styles.techText}>Olvídate de las molestas pastas de impresión. Digitalizamos tu boca de forma rápida y cómoda para diseñar tus tratamientos de ortodoncia e implantes.</p>
            </div>

            <div className="card" style={styles.techCard}>
              <ShieldCheck size={28} color="var(--primary-600)" style={{ marginBottom: '1rem' }} />
              <h4>Láser Dental Terapéutico</h4>
              <p style={styles.techText}>Permite realizar cirugías menores de encías con mínima hemorragia, curaciones más rápidas y una desinfección profunda sin dolor.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="section">
        <div className="container">
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Nuestro Equipo de Especialistas</h2>
            <p style={styles.sectionSubtitle}>Profesionales calificados y apasionados por la odontología estética y restaurativa.</p>
          </div>

          <div className="grid grid-3" style={{ marginTop: '3.5rem' }}>
            {dentists.map((dentist, i) => (
              <div className="card" key={i} style={styles.dentistCard}>
                <div style={styles.avatarLarge}>
                  {dentist.initials}
                </div>
                <h3 style={styles.dentistName}>{dentist.name}</h3>
                <span style={styles.dentistRole}>{dentist.role}</span>
                <span style={styles.dentistSpecialty}>{dentist.specialty}</span>
                <p style={styles.dentistBio}>{dentist.bio}</p>
              </div>
            ))}
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
  philosophyGrid: {
    alignItems: 'center',
    gap: '4rem',
  },
  philosophyContent: {
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  sectionHeading: {
    fontSize: '2rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  paragraph: {
    color: 'var(--text-secondary)',
    lineHeight: '1.7',
    fontSize: '1rem',
  },
  statsRow: {
    display: 'flex',
    gap: '2rem',
    marginTop: '1rem',
    flexWrap: 'wrap',
  },
  statBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  statNum: {
    fontSize: '2rem',
    fontWeight: 800,
    color: 'var(--primary-600)',
    fontFamily: 'var(--font-heading)',
  },
  statLabel: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    fontWeight: 600,
  },
  philosophyVisual: {
    display: 'flex',
    justifyContent: 'center',
  },
  missionCard: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '2.5rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    textAlign: 'left',
    width: '100%',
    maxWidth: '460px',
  },
  valueRow: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start',
  },
  valueIcon: {
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--primary-100)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  valueTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    marginBottom: '0.25rem',
    color: 'var(--text-primary)',
  },
  valueText: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
  },
  techSection: {
    textAlign: 'center',
  },
  techHeader: {
    maxWidth: '640px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  techTitle: {
    fontSize: '2rem',
    fontWeight: 700,
  },
  techDesc: {
    color: 'var(--text-secondary)',
  },
  techCard: {
    textAlign: 'left',
    padding: '2rem',
  },
  techText: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    marginTop: '0.75rem',
  },
  sectionHeader: {
    textAlign: 'center',
    maxWidth: '640px',
    margin: '0 auto',
  },
  sectionTitle: {
    fontSize: '2.25rem',
    fontWeight: 700,
  },
  sectionSubtitle: {
    color: 'var(--text-secondary)',
  },
  dentistCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '2.5rem 2rem',
  },
  avatarLarge: {
    width: '6rem',
    height: '6rem',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--primary-400), var(--primary-600))',
    color: 'white',
    fontSize: '2rem',
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5rem',
    boxShadow: '0 8px 24px rgba(20, 184, 166, 0.25)',
  },
  dentistName: {
    fontSize: '1.3rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '0.25rem',
  },
  dentistRole: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: 'var(--primary-600)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '0.25rem',
  },
  dentistSpecialty: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    marginBottom: '1rem',
  },
  dentistBio: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
  }
};
