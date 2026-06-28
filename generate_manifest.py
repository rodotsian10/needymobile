import os
import json

src_dir = r"E:\coding\needysite\@Resources\Images\Ame\sprites"
manifest = {}

for root, dirs, files in os.walk(src_dir):
    png_files = [f for f in files if f.endswith(".png")]
    if png_files:
        # Check if 0.png exists to verify it's an animation folder
        if "0.png" in png_files:
            rel_path = os.path.relpath(root, src_dir).replace("\\", "/")
            manifest[rel_path] = len(png_files)

# Add transformation paths manually since they are outside sprites folder
# transformation_dark has 99 frames
manifest["transformation_dark"] = 99

dest_file = r"E:\ame-jine-web\public\assets\sprites.json"
with open(dest_file, "w", encoding="utf-8") as f:
    json.dump(manifest, f, indent=2)

print(f"Manifest created at {dest_file} with {len(manifest)} animations.")
