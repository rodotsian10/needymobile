import os
import shutil

src_dir = r"E:\coding\needysite\@Resources\Images\Ame\sprites"
dest_dir = r"E:\ame-jine-web\haha"

if not os.path.exists(dest_dir):
    os.makedirs(dest_dir)

for root, dirs, files in os.walk(src_dir):
    if "0.png" in files:
        rel_path = os.path.relpath(root, src_dir)
        new_name = rel_path.replace(os.sep, "_") + ".png"
        src_file = os.path.join(root, "0.png")
        dest_file = os.path.join(dest_dir, new_name)
        shutil.copy2(src_file, dest_file)

print(f"Copied sample sprites to {dest_dir}")
