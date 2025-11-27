import { Button } from '@/components/ui/button';
import { delay } from '@/utils';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import { View, Text } from 'react-native';
import axios from 'axios';

export const Camara = () => {
  const cameraRef = useRef<CameraView>(null);
  const [isCameraReady, setIsCameraReady] = useState(false); // Para saber si podemos tomar fotos
  const [isProcessing, setIsProcessing] = useState(false); // Para deshabilitar botones
  const [photo, setPhoto] = useState<string | null>(null); // Para mostrar la *última* foto si quieres

  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    requestPermission();
  }, []);

  const capturarImagenes = async () => {
    if (!cameraRef.current) {
      console.error('Referencia de cámara no disponible.');
      setIsProcessing(false);
      return;
    }

    const options = { quality: 0.5, base64: false };

    try {
      for (let i = 0; i < 3; i++) {
        console.log(`--- Iniciando ciclo ${i + 1} de 3 ---`);

        const pic = await cameraRef.current.takePictureAsync(options);

        if (pic) {
          if (i === 2) setPhoto(pic.uri);
          const formData = new FormData();
          // formData.append('dir', 'f');

          const fileData = {
            uri: pic.uri,
            type: 'image/jpeg',
            name: `foto_${i}.jpg`,
          };

          formData.append('file', fileData as any);
          console.log(`Enviando foto ${i + 1} a 172.25.81.50...`);

          await axios.post('http://10.56.2.44:8000/upload_image/', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          console.log(`Foto ${i + 1} subida con éxito.`);
        }

        if (i < 2) {
          await delay(1000);
        }
      }

      console.log('Ráfaga y subida completada.');
    } catch (e) {
      console.error('Error durante el proceso de captura/subida', e);
    } finally {
      setIsProcessing(false);
      console.log('Proceso terminado.');
    }
  };
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
      <Button onPress={capturarImagenes}>
        <Text>Capturar imagenes</Text>
      </Button>
    </View>
  );
};

export default Camara;
