import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Link, Stack } from 'expo-router';
import { MoonStarIcon, StarIcon, SunIcon, Camera as CameraIcon, X } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Image, type ImageStyle, View, StyleSheet } from 'react-native';
import { useState, useRef, useEffect } from 'react'; // Hooks de React
import axios from 'axios';
import { CameraView, useCameraPermissions } from 'expo-camera';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const LOGO = {
  light: require('@/assets/images/react-native-reusables-light.png'),
  dark: require('@/assets/images/react-native-reusables-dark.png'),
};

const SCREEN_OPTIONS = {
  title: 'React Native Reusables',
  headerTransparent: true,
  headerRight: () => <ThemeToggle />,
};

const IMAGE_STYLE: ImageStyle = {
  height: 76,
  width: 76,
};

export default function Screen() {
  const { colorScheme } = useColorScheme();
  // 1. Permisos
  const [permission, requestPermission] = useCameraPermissions();
  // 2. Referencia al componente de cámara
  const cameraRef = useRef<CameraView>(null);
  // 3. Estado para mostrar la cámara (en lugar de los controles)
  const [showCamera, setShowCamera] = useState(false);
  // 4. Estado para guardar la URI de la foto tomada
  const [photo, setPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false); // <-- NUEVO: Para deshabilitar el botón

  // 5. Pide permiso al cargar el componente
  useEffect(() => {
    requestPermission();
  }, []);

  let uris: string[] = [];
  const options = { quality: 0.5, base64: false };
  // 6. Función para tomar la foto
  const takePicture = async () => {
    if (cameraRef.current) {
      // Opciones de la foto (puedes ajustar la calidad)
      const options = { quality: 0.5, base64: false };
      try {
        // 2. Bucle para tomar 3 fotos
        for (let i = 0; i < 3; i++) {
          console.log(`Tomando foto ${i + 1}...`);
          const pic = await cameraRef.current.takePictureAsync(options);
          if (pic) {
            uris.push(pic.uri);
          }

          // 3. Esperar 1 segundo, EXCEPTO después de la última foto
          if (i < 2) {
            await delay(1000); // 1000 ms = 1 segundo
          }
        }
        console.log('Ráfaga completada:', uris);
        setShowCamera(false); // Salir de la cámara
      } catch (e) {
        console.error('Error durante la ráfaga', e);
      } finally {
        // 4. Reactivar el botón, incluso si hay un error
        setIsCapturing(false);
      }
    }
  };

  const enviarOrden = async () => {
    try {
      await axios.post('http://10.56.5.123/control_post', { dir: 'r' });
    } catch {
      console.log('error');
    }
  };

  // Estado de carga de permisos
  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Solicitando permisos de cámara...</Text>
      </View>
    );
  }

  // Estado si los permisos fueron denegados
  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center gap-4 p-4">
        <Text className="text-center">Necesitamos tu permiso para mostrar la cámara.</Text>
        <Button onPress={requestPermission}>
          <Text>Conceder Permiso</Text>
        </Button>
      </View>
    );
  }

  // Si la cámara debe mostrarse
  if (showCamera) {
    return (
      <View style={StyleSheet.absoluteFill}>
        <CameraView
          ref={cameraRef}
          style={{ flex: 1 }}
          facing="back" // Puedes cambiar a 'front'
        />
        {/* Botón para tomar la foto (sobre la cámara) */}
        <View className="absolute bottom-10 w-full items-center">
          <Button size="icon" className="ios:size-16 h-16 w-16 rounded-full" onPress={takePicture}>
            <Icon as={CameraIcon} className="size-8" />
          </Button>
        </View>
        {/* Botón para cerrar la cámara */}
        <View className="absolute right-4 top-16">
          <Button
            size="icon"
            variant="ghost"
            className="ios:size-9 rounded-full bg-white/30"
            onPress={() => setShowCamera(false)}>
            <Icon as={X} className="size-5" color="black" />
          </Button>
        </View>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <View className="flex-1 items-center justify-center gap-8 p-4">
        <View className="gap-2 p-4">
          <Text className="ios:text-foreground font-mono text-sm text-muted-foreground">
            Control de <Text variant="code">Robot Movil</Text>.
          </Text>
        </View>

        {/* Muestra la foto si existe */}
        {photo && (
          <View className="items-center gap-2">
            <Image source={{ uri: photo }} className="h-40 w-40 rounded-lg" />
            <Button variant="link" onPress={() => setPhoto(null)}>
              <Text>Borrar Foto</Text>
            </Button>
          </View>
        )}

        {/* Botón para ABRIR la cámara */}
        <Button onPress={() => setShowCamera(true)}>
          <Text>Abrir Cámara</Text>
        </Button>

        <View className="">
          <Button onPressIn={enviarOrden}>
            <Text>Adelante 5seg</Text>
          </Button>
        </View>
        <View className="flex-row gap-2">
          <Button>
            <Text>Giro Derecha</Text>
          </Button>
          <Button>
            <Text>Giro Izquierda</Text>
          </Button>
        </View>
        <View className="">
          <Button>
            <Text>Atras 5seg</Text>
          </Button>
        </View>
      </View>
    </>
  );
}

const THEME_ICONS = {
  light: SunIcon,
  dark: MoonStarIcon,
};

function ThemeToggle() {
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
