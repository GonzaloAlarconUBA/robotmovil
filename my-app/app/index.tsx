import { Button } from '@/components/ui/button';
import Layout from '@/src/layouts';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Stack } from 'expo-router';
import { MoonStarIcon, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
// Hooks de React actualizados
import { View, StyleSheet } from 'react-native';
import { useState } from 'react';
import axios from 'axios';
import Camara from '@/src/components/Camara';

const SCREEN_OPTIONS = {
  title: 'React Native Reusables',
  headerTransparent: true,
  headerRight: () => <ThemeToggle />,
};

export default function Screen() {
  const [isProcessing, setIsProcessing] = useState(false); // Para deshabilitar botones
  const enviarOrdenes = async () => {
    try {
      await axios.post('http://10.56.16.23/add', { dir: 'f' });
      await axios.post('http://10.56.16.23/run');
      await axios.post('http://10.56.16.23/add', { dir: 'f' });
      await axios.post('http://10.56.16.23/run');
    } catch {
      console.log('error');
    }
  };

  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />

      <Layout>
        <Camara />

        <Button onPress={enviarOrdenes} disabled={isProcessing}>
          <Text>{isProcessing ? 'Procesando...' : 'Comenzar movimiento'}</Text>
        </Button>
      </Layout>
    </>
  );
}

const THEME_ICONS = {
  light: SunIcon,
  dark: MoonStarIcon,
};

function ThemeToggle() {
  // ... (sin cambios)
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <Button
      onPressIn={toggleColorScheme}
      size="icon"
      variant="ghost"
      className="ios:size-9 rounded-full web:mx-4">
      <Icon as={THEME_ICONS[colorScheme ?? 'light']} className="size-5" />
    </Button>
  );
}

// 10. AÑADIR ESTILOS PARA LA CÁMARA OCULTA
const styles = StyleSheet.create({
  hiddenCamera: {
    position: 'absolute',
    top: -9999, // Moverla muy fuera de la pantalla
    left: -9999,
    width: 1, // Tamaño mínimo
    height: 1,
    opacity: 0, // Hacerla invisible
  },
});

