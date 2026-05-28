import cloudinary
import cloudinary.uploader
from config import CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET,
    secure=True
)

def subir_foto(foto_b64):
    resultado = cloudinary.uploader.upload(
        f"data:image/jpeg;base64,{foto_b64}",
        folder="tijuana_barreras"
    )
    return resultado['secure_url']