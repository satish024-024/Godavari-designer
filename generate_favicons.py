import os
from PIL import Image

def generate_favicons():
    img_path = 'logo.jpeg'
    if not os.path.exists(img_path):
        print(f"Error: {img_path} not found")
        return
        
    img = Image.open(img_path)
    
    # Save standard sizes
    sizes = {
        'favicon-16x16.png': (16, 16),
        'favicon-32x32.png': (32, 32),
        'favicon-48x48.png': (48, 48),
        'favicon-96x96.png': (96, 96),
        'favicon-144x144.png': (144, 144),
        'favicon-192x192.png': (192, 192),
        'favicon-512x512.png': (512, 512),
        'apple-touch-icon.png': (180, 180),
    }
    
    for name, size in sizes.items():
        try:
            resample_mode = Image.Resampling.LANCZOS
        except AttributeError:
            resample_mode = Image.ANTIALIAS
            
        resized = img.resize(size, resample=resample_mode)
        resized.save(name, 'PNG')
        print(f"Generated {name} ({size[0]}x{size[1]})")
        
    # Save favicon.ico (multi-resolution format)
    try:
        resample_mode = Image.Resampling.LANCZOS
    except AttributeError:
        resample_mode = Image.ANTIALIAS
        
    ico_img = img.resize((48, 48), resample=resample_mode)
    ico_img.save('favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])
    print("Generated favicon.ico (16, 32, 48)")

if __name__ == '__main__':
    generate_favicons()
