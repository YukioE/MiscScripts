import os
import shutil
import time
import getpass
from tkinter import Tk
from tkinter.filedialog import askdirectory
from tkinter.simpledialog import askstring

def clear_source_folder(source_folder):
    for file_name in os.listdir(source_folder):
        try:
            os.remove(os.path.join(source_folder, file_name))
            print(f"Deleted during initialization: {file_name}")
        except Exception as e:
            print(f"Error deleting file {file_name} during initialization: {e}")

def move_and_delete_files(source_folder, destination_folder, continuous):
    moved_files = set()

    if continuous:
        # Clear all files in the source folder before starting continuous mode
        clear_source_folder(source_folder)

    while True:
        # List all .png files in the source folder
        files = [f for f in os.listdir(source_folder) if f.endswith('.png')]

        for file_name in files:
            if file_name not in moved_files:
                source_path = os.path.join(source_folder, file_name)
                destination_path = os.path.join(destination_folder, file_name)

                try:
                    shutil.move(source_path, destination_path)
                    print(f"Moved: {file_name}")
                    moved_files.add(file_name)
                except Exception as e:
                    print(f"Error moving file {file_name}: {e}")

        # List and remove all .json files in the source folder
        json_files = [f for f in os.listdir(source_folder) if f.endswith('.json')]
          
        for file_name in json_files:
            try:
                os.remove(os.path.join(source_folder, file_name))
                print(f"Deleted: {file_name}")
            except Exception as e:
                print(f"Error deleting file {file_name}: {e}")

        if not continuous:
            break
        
        # Wait for 3 seconds before checking the folder again
        time.sleep(3)

def move_latest_and_rename(source_folder, destination_folder):
    # List all .png files in the source folder
    files = [f for f in os.listdir(source_folder) if f.endswith('.png')]

    if not files:
        print("No .png files found in the source folder.")
        return

    # Find the latest .png file
    latest_file = max(files, key=lambda f: os.path.getctime(os.path.join(source_folder, f)))
    source_path = os.path.join(source_folder, latest_file)

    # Ask user for the new file name
    root = Tk()
    root.withdraw()
    new_name = askstring("Rename File", "Enter the new name for the latest .png file (without extension):")

    if not new_name:
        print("No new name provided.")
        return

    # Ensure the new file name has .png extension
    destination_path = os.path.join(destination_folder, new_name + ".png")

    try:
        shutil.move(source_path, destination_path)
        print(f"Moved and renamed: {latest_file} to {new_name}.png")
    except Exception as e:
        print(f"Error moving and renaming file {latest_file}: {e}")

if __name__ == "__main__":
    current_user = getpass.getuser()
    source_folder = fr"C:\Users\{current_user}\AppData\Local\Packages\MicrosoftWindows.Client.CBS_cw5n1h2txyewy\TempState\ScreenClip"

    # Open a file dialog to select the destination folder
    root = Tk()
    root.withdraw()  # Hide the root window
    destination_folder = askdirectory(title="Select the destination folder")

    if not destination_folder:
        print("No destination folder selected.")
    elif not os.path.exists(destination_folder):
        print(f"The destination folder {destination_folder} does not exist.")
    else:
        # Ask user for mode selection
        mode = askstring("Mode Selection", "Enter '0' for one-time move all, '1' for continuous mode, or '2' for move latest and rename mode:")

        if mode == "0":
            move_and_delete_files(source_folder, destination_folder, continuous=False)
        elif mode == "1":
            move_and_delete_files(source_folder, destination_folder, continuous=True)
        elif mode == "2":
            move_latest_and_rename(source_folder, destination_folder)
        else:
            print("Invalid mode selected.")
