import { Button } from '@/components/ui/button';
import { delay } from '@/utils';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import { View, Text } from 'react-native';

export const Camara = () => {
  const cameraRef = useRef<CameraView>(null);
  const [isCameraReady, setIsCameraReady] = useState(false); // Para saber si podemos tomar fotos
  const [isProcessing, setIsProcessing] = useState(false); // Para deshabilitar botones
  const [photo, setPhoto] = useState<string | null>(null); // Para mostrar la *última* foto si quieres

  const [permission, requestPermission] = useCameraPermissions();
  // 2. Referencia al componente de cámara (sin cambios)

  // 3. ESTADOS ACTUALIZADOS
  // (Eliminamos showCamera)

  // 4. Pide permiso al cargar el componente (sin cambios)
  useEffect(() => {
    requestPermission();
  }, []);
  const capturarImagenes = async () => {
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
  return (
    <View>
      <Text className="ios:text-foreground font-mono text-sm text-muted-foreground">camara</Text>
      <CameraView
        ref={cameraRef}
        // style={styles.hiddenCamera}
        facing="back"
        onCameraReady={() => {
          console.log('Cámara lista.');
          setIsCameraReady(true);
        }}
      />
    </View>
  );
};

export default Camara;
