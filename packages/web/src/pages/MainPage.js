import React from 'react';
import NavigationBar from '../components/NavigationBar';
import HeroSection from '../components/HeroSection';
import FeatureCards from '../components/FeatureCards';
import Footer from '../components/Footer';

function MainPage() {
  return (
    <>
      <NavigationBar />
      <main>
        <HeroSection />
        <FeatureCards />
      </main>
      <Footer />
    </>
  );
}

export default MainPage;
