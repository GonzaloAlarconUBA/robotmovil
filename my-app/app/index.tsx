import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Link, Stack } from 'expo-router';
import { MoonStarIcon, StarIcon, SunIcon, Camera as CameraIcon, X } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Image, type ImageStyle, View, StyleSheet } from 'react-native';
import { useState, useRef, useEffect } from 'react'; // Hooks de React
import axios from 'axios'; // Asegúrate de que axios esté instalado
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

  // 3. Estados
  const [photo, setPhoto] = useState<string | null>(null); // Última foto tomada
  const [isProcessing, setIsProcessing] = useState(false); // Para deshabilitar botones
  const [isCameraReady, setIsCameraReady] = useState(false); // Para saber si podemos tomar fotos

  // 4. Pide permiso al cargar
  useEffect(() => {
    requestPermission();
  }, []);

  // 5. Función de ráfaga de fotos (MODIFICADA)
  // Ahora solo se enfoca en tomar las fotos.
  // El control de estado 'isProcessing' se mueve a la función que la llama.
  const startAutonomousCapture = async () => {
    if (!cameraRef.current) {
      console.error('Referencia de cámara no disponible.');
      throw new Error('Referencia de cámara no encontrada'); // Lanzar error
    }

    const uris: string[] = [];
    const options = { quality: 0.5, base64: false };

    try {
      // Bucle para tomar 3 fotos
      for (let i = 0; i < 3; i++) {
        console.log(`Tomando foto autónoma ${i + 1}...`);
        const pic = await cameraRef.current.takePictureAsync(options);
        if (pic) {
          uris.push(pic.uri);
          // Mostrar la última foto en la UI
          if (i === 2) {
            setPhoto(pic.uri);
          }
        }
        // Esperar 1 segundo
        if (i < 2) {
          await delay(1000);
        }
      }
      console.log('Ráfaga autónoma completada:', uris);
    } catch (e) {
      console.error('Error durante la ráfaga autónoma', e);
      throw e; // Propagar el error para que 'enviarOrdenR' lo vea
    }
  };

  // --- Funciones de control (sin cambios) ---
  const enviarOrdenAd = async () => {
    try {
      await axios.post('http://10.56.5.251/add', { dir: 'f' });
    } catch {
      console.log('error');
    }
  };
  const enviarOrdenI = async () => {
    try {
      await axios.post('http://10.56.5.251/add', { dir: 'l' });
    } catch {
      console.log('error');
    }
  };
  const enviarOrdenD = async () => {
    try {
      await axios.post('http://10.56.5.251/add', { dir: 'r' });
    } catch {
      console.log('error');
    }
  };
  const enviarOrdenAt = async () => {
    try {
      await axios.post('http://10.56.5.251/add', { dir: 'b' });
    } catch {
      console.log('error');
    }
  };

  // 6. FUNCIÓN 'RUN' (MODIFICADA CON LA NUEVA LÓGICA)
  // Esta es la orquestadora principal
  const enviarOrdenR = async () => {
    if (!isCameraReady) {
      console.warn('La cámara no está lista. Intente de nuevo.');
      return;
    }

    setIsProcessing(true); // Deshabilitar todos los botones

    try {
      // --- INICIO DE LA NUEVA LÓGICA ---

      // 1. Consultar cuántos comandos hay
      let commandCount = 0;
      try {
        const response = await axios.get('http://10.56.5.251/');

        // **IMPORTANTE**: Ajusta la siguiente línea según la respuesta REAL de tu API.
        // Asumo que devuelve algo como: { "command_count": 5 }
        commandCount = response.data.command_count;

        console.log(`Comandos detectados: ${commandCount}`);
      } catch (e) {
        console.error('Error al consultar la cantidad de comandos', e);
        // Si no podemos consultar, no continuamos.
        throw new Error('Fallo al consultar el robot');
      }

      // 2. Calcular el tiempo de espera
      const waitTimeMs = commandCount * 1000; // 1 segundo por comando

      // 3. Ejecutar solo si hay comandos
      if (waitTimeMs > 0) {
        // 4. Enviar la orden de correr
        await axios.post('http://10.56.5.251/run', { dir: 'b' }); // Asumo que 'dir' es necesario
        console.log(`Orden RUN enviada. Esperando ${commandCount} segundos...`);

        // 5. Esperar a que el robot termine (¡el await clave!)
        await delay(waitTimeMs);

        console.log('Movimiento terminado. Iniciando captura autónoma...');

        // 6. Iniciar la captura (y esperar a que termine)
        await startAutonomousCapture();

        console.log('Captura terminada.');
      } else {
        console.log('No hay comandos en la cola. No se ejecuta el movimiento.');
      }
      // --- FIN DE LA NUEVA LÓGICA ---
    } catch (e) {
      console.error('Error durante el proceso de RUN o captura', e);
    } finally {
      // 7. Pase lo que pase (error o éxito), reactivar los botones al final
      setIsProcessing(false);
      console.log('Proceso RUN completado. Botones reactivados.');
    }
  };

  // --- Vistas de permisos (sin cambios) ---
  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Solicitando permisos de cámara...</Text>
      </View>
    );
  }

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

  // --- VISTA PRINCIPAL ---
  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />

      {/* 7. CÁMARA OCULTA */}
      <CameraView
        ref={cameraRef}
        style={styles.hiddenCamera}
        facing="back"
        onCameraReady={() => {
          console.log('Cámara lista.');
          setIsCameraReady(true);
        }}
      />

      <View className="flex-1 items-center justify-center gap-8 p-4">
        <View className="gap-2 p-4">
          <Text className="ios:text-foreground font-mono text-sm text-muted-foreground">
            Control de <Text variant="code">Robot Movil</Text>.
          </Text>
        </View>

        {/* Muestra la última foto si existe */}
        {photo && (
          <View className="items-center gap-2">
            <Image source={{ uri: photo }} className="h-40 w-40 rounded-lg" />
            <Button variant="link" onPress={() => setPhoto(null)}>
              <Text>Borrar Foto</Text>
            </Button>
          </View>
        )}

        {/* 8. BOTONES DE CONTROL (deshabilitados mientras 'isProcessing' sea true) */}
        <View className="">
          <Button onPress={enviarOrdenAd} disabled={isProcessing}>
            <Text>Adelante 5seg</Text>
          </Button>
        </View>
        <View className="flex-row gap-2">
          <Button onPress={enviarOrdenD} disabled={isProcessing}>
            <Text>Giro Derecha</Text>
          </Button>
          <Button onPress={enviarOrdenI} disabled={isProcessing}>
            <Text>Giro Izquierda</Text>
          </Button>
        </View>
        <View className="">
          <Button onPress={enviarOrdenAt} disabled={isProcessing}>
            <Text>Atras 5seg</Text>
          </Button>
        </View>

        {/* 9. BOTÓN 'RUN' */}
        <Button
          onPress={enviarOrdenR}
          disabled={isProcessing || !isCameraReady} // Deshabilitado si procesa o si la cámara no está lista
        >
          <Text>
            {isProcessing
              ? 'Procesando...'
              : !isCameraReady
                ? 'Cargando cámara...'
                : 'Comenzar movimiento'}
          </Text>
        </Button>
      </View>
    </>
  );
}

// --- Componente ThemeToggle (sin cambios) ---
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

// 10. ESTILOS PARA LA CÁMARA OCULTA (sin cambios)
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
