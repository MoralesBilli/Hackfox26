import { useState } from 'react';
import type { ReactElement } from 'react';

import { AccessibilityProvider } from './AccesibilidadContext';

// Importación de pantallas
import FeedScreen from './FeedScreen';
import MapScreen from './MapScreen';
import GenerarReporte from './GenerarReporte';
import ProfileScreen from './ProfileScreen';
// Nota: Asegúrate de que este archivo coincida con el componente que editamos antes (AccessibilityPanelScreen)
import Accesibilidad from './Accesibilidad';
import PlaneadorDeRuta from './PlaneadorDeRuta';
import NavegacionActiva from './NavegacionActiva';
import OnBoardingScreen from './OnBoardingScreen';
import ReporteExitosoScreen from './ReporteExitosoScreen';

type Screen =
  | 'feed'
  | 'map'
  | 'report'
  | 'profile'
  | 'accessibility'
  | 'route-planner'
  | 'active-nav'
  | 'onboarding'
  | 'success-report';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('feed');

  const navigate = (screen: string) => {
    // 'home' redirige al feed principal
    const target = screen === 'home' ? 'feed' : screen;
    setCurrentScreen(target as Screen);
  };

  const screenMap: Record<Screen, ReactElement> = {
    feed: <FeedScreen onNavigate={navigate} />,
    map: <MapScreen onNavigate={navigate} />,
    report: <GenerarReporte onNavigate={navigate} />,
    profile: <ProfileScreen onNavigate={navigate} />,
    accessibility: <Accesibilidad onNavigate={navigate} />,
    'route-planner': <PlaneadorDeRuta onNavigate={navigate} />,
    'active-nav': <NavegacionActiva onNavigate={navigate} />,
    onboarding: <OnBoardingScreen onNavigate={navigate} />,
    'success-report': <ReporteExitosoScreen onNavigate={navigate} />,
  };

  return (
    // Envolvemos toda la aplicación en el Provider para que los estilos y filtros funcionen en todas las pantallas
    <AccessibilityProvider>
      {screenMap[currentScreen] ?? <FeedScreen onNavigate={navigate} />}
    </AccessibilityProvider>
  );
}

export default App;