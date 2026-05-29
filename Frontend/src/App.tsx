import { useState } from 'react';
import type { ReactElement } from 'react';

import { AccessibilityProvider } from './AccesibilidadContext';
import { LanguageProvider } from './LanguageContext';

// Importación de pantallas
import FeedScreen from './FeedScreen';
import MapScreen from './MapScreen';
import GenerarReporte from './GenerarReporte';
import ProfileScreen from './ProfileScreen';
// Nota: Asegúrate de que este archivo coincida con el componente que editamos antes (AccessibilityPanelScreen)
import Accesibilidad from './Accesibilidad';
import PlaneadorDeRuta from './PlaneadorDeRuta';
import NavegacionActiva from './NavegacionActiva';
import ReporteExitosoScreen from './ReporteExitosoScreen';
import LoginScreen from './LoginScreen';
import RegistroScreen from './RegistroScreen';
import ChatAsistente from './ChatAsistente';

type Screen =
  | 'feed'
  | 'map'
  | 'report'
  | 'profile'
  | 'accessibility'
  | 'route-planner'
  | 'active-nav'
  | 'success-report'
  | 'login'
  | 'registro';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('feed');
  const [screenParams, setScreenParams] = useState<any>(null);

  const navigate = (screen: string, params?: any) => {
    // 'home' redirige al feed principal
    let target = screen === 'home' ? 'feed' : screen;
    
    // Interceptar pantallas protegidas si no hay token de autenticación
    if ((target === 'profile' || target === 'report') && !localStorage.getItem('token')) {
      target = 'login';
    }
    
    setScreenParams(params || null);
    setCurrentScreen(target as Screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'feed': return <FeedScreen onNavigate={navigate} />;
      case 'map': return <MapScreen onNavigate={navigate} />;
      case 'report': return <GenerarReporte onNavigate={navigate} />;
      case 'profile': return <ProfileScreen onNavigate={navigate} />;
      case 'accessibility': return <Accesibilidad onNavigate={navigate} />;
      case 'route-planner': return <PlaneadorDeRuta onNavigate={navigate} />;
      case 'active-nav': return <NavegacionActiva onNavigate={navigate} />;
      case 'success-report': return <ReporteExitosoScreen onNavigate={navigate} params={screenParams} />;
      case 'login': return <LoginScreen onNavigate={navigate} />;
      case 'registro': return <RegistroScreen onNavigate={navigate} />;
      default: return <FeedScreen onNavigate={navigate} />;
    }
  };

  return (
    // Envolvemos toda la aplicación en el Provider para que los estilos y filtros funcionen en todas las pantallas
    <AccessibilityProvider>
      <LanguageProvider>
        {renderScreen()}
        <ChatAsistente onNavigate={navigate} />
        <Accesibilidad onNavigate={navigate} />
      </LanguageProvider>
    </AccessibilityProvider>
  );
}

export default App;