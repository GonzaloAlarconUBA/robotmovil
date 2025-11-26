from typing import Union
from fastapi import FastAPI, File, UploadFile
from pathlib import Path
import shutil

app = FastAPI()

# Directorio donde se guardarán las imágenes
IMAGE_DIR = Path("uploaded_images")
IMAGE_DIR.mkdir(exist_ok=True) # Crea el directorio si no existe

@app.post("/upload_image/")
async def upload_image(file: UploadFile = File(...)):
    # 1. Obtener el nombre del archivo
    file_location = IMAGE_DIR / file.filename
    
    # 2. Guardar el archivo en el servidor
    try:
        with open(file_location, "wb") as buffer:
            # Usa shutil.copyfileobj para copiar el contenido del archivo subido 
            # al archivo local, manejando eficientemente archivos grandes.
            shutil.copyfileobj(file.file, buffer) 
    except Exception as e:
        return {"message": "Hubo un error al subir el archivo", "error": str(e)}
    finally:
        # Asegúrate de cerrar el archivo subido
        await file.close()

    return {"filename": file.filename, "message": "Imagen subida exitosamente"}

# Si usas Uvicorn para correr tu app, el comando sería: uvicorn main:app --reload

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}