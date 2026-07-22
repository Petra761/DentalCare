import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Navbar />
      <main style={styles.main}>
        {children}
      </main>
      <Footer />
    </>
  );
};

const styles = {
  main: {
    flex: '1 0 auto',
    display: 'flex',
    flexDirection: 'column' as const,
  }
};
