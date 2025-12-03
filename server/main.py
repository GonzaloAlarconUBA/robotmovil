from typing import Union
from fastapi import FastAPI, File, UploadFile, Form
from pathlib import Path
import shutil
from datetime import datetime

app = FastAPI()

BASE_IMAGE_DIR = Path("uploaded_images")
BASE_IMAGE_DIR.mkdir(exist_ok=True)

@app.post("/upload_image/")
async def upload_image(file: UploadFile = File(...), run_id: str = Form(...)):
    now = datetime.now()
    
    day_folder_name = now.strftime("%Y-%m-%d")
    
    time_folder_name = run_id
    
    day_dir = BASE_IMAGE_DIR / day_folder_name
    run_dir = day_dir / time_folder_name 
    
    run_dir.mkdir(parents=True, exist_ok=True)
    
    file_location = run_dir / file.filename

    try:
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer) 
    except Exception as e:
        return {"message": "Hubo un error al subir el archivo", "error": str(e)}
    finally:
        await file.close()

    return {
        "filename": file.filename, 
        "path": str(file_location.relative_to(BASE_IMAGE_DIR)),
        "message": "Imagen subida exitosamente"
    }


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}