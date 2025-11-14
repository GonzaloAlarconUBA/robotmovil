import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Link, Stack } from 'expo-router';
import { MoonStarIcon, StarIcon, SunIcon, Camera as CameraIcon, X } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
// Hooks de React actualizados
import { Image, type ImageStyle, View, StyleSheet } from 'react-native';
import { useState, useRef, useEffect } from 'react';
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
  // 1. Permisos (sin cambios)
  const [permission, requestPermission] = useCameraPermissions();
  // 2. Referencia al componente de cámara (sin cambios)
  const cameraRef = useRef<CameraView>(null);

  // 3. ESTADOS ACTUALIZADOS
  // (Eliminamos showCamera)
  const [photo, setPhoto] = useState<string | null>(null); // Para mostrar la *última* foto si quieres
  const [isProcessing, setIsProcessing] = useState(false); // Para deshabilitar botones
  const [isCameraReady, setIsCameraReady] = useState(false); // Para saber si podemos tomar fotos

  // 4. Pide permiso al cargar el componente (sin cambios)
  useEffect(() => {
    requestPermission();
  }, []);

  // 5. Función para tomar la ráfaga de fotos
  // Renombrada para mayor claridad y ajustada para manejar el estado 'isProcessing'
  const startAutonomousCapture = async () => {
    if (!cameraRef.current) {
      console.error('Referencia de cámara no disponible.');
      setIsProcessing(false); // Hay un problema, re-habilitar botones
      return;
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
          // Opcional: mostrar la última foto en la UI
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
    } finally {
      // Al terminar (con o sin error), re-habilitamos los botones
      setIsProcessing(false);
      console.log('Proceso terminado.');
    }
  };

  // --- Funciones de control (sin cambios, excepto por 'onPress') ---
  const enviarOrdenAd = async () => {
    try {
      await axios.post('http://10.56.16.23/add', { dir: 'f' });
    } catch {
      console.log('error');
    }
  };
  const enviarOrdenI = async () => {
    try {
      await axios.post('http://10.56.16.23/add', { dir: 'l' });
    } catch {
      console.log('error');
    }
  };
  const enviarOrdenD = async () => {
    try {
      await axios.post('http://10.56.16.23/add', { dir: 'r' });
    } catch {
      console.log('error');
    }
  };
  const enviarOrdenAt = async () => {
    try {
      await axios.post('http://10.56.16.23/add', { dir: 'b' });
    } catch {
      console.log('error');
    }
  };

  // 6. FUNCIÓN 'RUN' MODIFICADA
  // Esta función ahora inicia todo el proceso autónomo
  const enviarOrdenR = async () => {
    // Doble chequeo por si acaso
    if (!isCameraReady) {
      console.warn('La cámara no está lista. Intente de nuevo.');
      return;
    }
    
    setIsProcessing(true); // Deshabilitar botones
    
    try {
      // 1. Enviar la orden de correr
      await axios.post('http://10.56.16.23/run', { dir: 'b' });
      console.log('Orden RUN enviada. Iniciando captura...');
      
      // 2. Inmediatamente después, iniciar la captura
      // No usamos 'await' aquí si queremos que la captura ocurra *mientras*
      // el robot (presumiblemente) se está moviendo.
      // Si quieres que las fotos se tomen DESPUÉS de que 'run' termine,
      // y 'run' es una acción corta, entonces usa 'await'.
      // Para este caso, asumiré que 'run' inicia el movimiento y
      // la captura debe empezar ya.
      
      // Llamamos a la función. El 'finally' dentro de startAutonomousCapture
      // se encargará de poner setIsProcessing(false) cuando termine.
      startAutonomousCapture();

    } catch(e) {
      console.log('Error al enviar orden RUN', e);
      setIsProcessing(false); // Si 'run' falla, re-habilitar botones
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

  // --- SE ELIMINA EL BLOQUE 'if (showCamera)' ---

  // --- VISTA PRINCIPAL (MODIFICADA) ---
  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />

      {/* 7. CÁMARA OCULTA */}
      {/* Se renderiza siempre, pero de forma invisible, para que el 'ref' exista */}
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

        {/* Muestra la foto si existe */}
        {photo && (
          <View className="items-center gap-2">
            <Image source={{ uri: photo }} className="h-40 w-40 rounded-lg" />
            <Button variant="link" onPress={() => setPhoto(null)}>
              <Text>Borrar Foto</Text>
            </Button>
          </View>
        )}

        {/* SE ELIMINA EL BOTÓN 'Abrir Cámara' */}

        {/* 8. BOTONES DE CONTROL */}
        {/* Usamos 'onPress' y los deshabilitamos con 'isProcessing' */}
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

        {/* 9. BOTÓN 'RUN' MODIFICADO */}
        <Button
          onPress={enviarOrdenR}
          // Deshabilitado si está procesando O si la cámara aún no está lista
          disabled={isProcessing || !isCameraReady} 
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