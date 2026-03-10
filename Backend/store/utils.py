from PIL import Image
from sentence_transformers import SentenceTransformer

# Load CLIP only
model = SentenceTransformer('clip-ViT-B-32')

def get_image_vector(image_file):
    try:
        img = Image.open(image_file).convert("RGB")
        return model.encode(img).tolist()
    except Exception as e:
        print(f"Error encoding image: {e}")
        return None