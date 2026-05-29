import { useState } from 'react';
import OnboardingScreen from './OnBoardingScreen';
import LoginScreen from './LoginScreen';
import RegistroScreen from './RegistroScreen';
import HomeScreen from './HomeScreen';
import MapScreen from './MapScreen';
import ReportScreen from './GenerarReporte';
import ProfileScreen from './ProfileScreen';
import RoutePlannerScreen from './PlaneadorDeRuta';
import RouteResultScreen from './ResultadoRuta';
import ActiveNavigationScreen from './NavegacionActiva';
import AccessibilityPanelScreen from './Accesibilidad';
import SuccessScreen from './ReporteExitosoScreen';

function App() {
  const [currentScreen, setCurrentScreen] = useState<string>('onboarding');
  const [prevScreen, setPrevScreen] = useState<string>('onboarding');

  const navigate = (screen: string) => {
    setPrevScreen(currentScreen);
    setCurrentScreen(screen);
  };

  switch (currentScreen) {
    case 'onboarding':
      return <OnboardingScreen onNavigate={navigate} />;
    case 'login':
      return <LoginScreen onNavigate={navigate} />;
    case 'register':
    case 'registro':
      return <RegistroScreen onNavigate={navigate} />;
    case 'home':
      return <HomeScreen onNavigate={navigate} />;
    case 'map':
    case 'mapa':
      return <MapScreen onNavigate={navigate} />;
    case 'report':
    case 'reportar':
      return <ReportScreen onNavigate={navigate} />;
    case 'profile':
    case 'perfil':
      return <ProfileScreen onNavigate={navigate} />;
    case 'route-planner':
    case 'planeador':
      return <RoutePlannerScreen onNavigate={navigate} />;
    case 'route-result':
    case 'resultado':
      return <RouteResultScreen onNavigate={navigate} />;
    case 'active-nav':
    case 'navegacion':
      return <ActiveNavigationScreen onNavigate={navigate} />;
    case 'accessibility':
    case 'accesibilidad':
      return <AccessibilityPanelScreen onNavigate={() => navigate(prevScreen)} />;
    case 'success-report':
      return <SuccessScreen onNavigate={navigate} />;
    default:
      return <HomeScreen onNavigate={navigate} />;
  }
}

export default App;