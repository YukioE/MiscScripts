import os
import time
from tkinter import Tk, Label, filedialog, simpledialog, StringVar, OptionMenu, Button

class FolderMonitor:
    def __init__(self, master):
        self.master = master
        self.folder_path = None
        self.extension_var = StringVar(master)
        self.extension_var.set('.png')

    def select_folder(self):
        folder_path = filedialog.askdirectory(title="Select the folder to monitor for files")
        if folder_path and os.path.exists(folder_path):
            self.folder_path = folder_path
        else:
            print("No valid folder selected.")

    def count_files_with_extension(self):
        if not self.folder_path:
            return 0
        extension = self.extension_var.get()
        if extension == "Custom":
            extension = simpledialog.askstring("Custom Extension", "Enter the custom file extension (include the dot):")
            self.extension_var.set(extension)  # Update the variable to the custom extension
        return len([f for f in os.listdir(self.folder_path) if f.endswith(extension)])

    def update_label(self, label):
        current_count = self.count_files_with_extension()
        label.config(text=str(current_count))
        label.after(2000, self.update_label, label)  # Update every 2 seconds

if __name__ == "__main__":
    # Create the main tkinter window
    root = Tk()
    root.withdraw()

    # Create an instance of the FolderMonitor class
    monitor = FolderMonitor(root)

    # Initial folder selection
    monitor.select_folder()
    
    if not monitor.folder_path:
        exit()
    
    # List of common file extensions
    common_extensions = ['.png', '.jpg', '.jpeg', '.txt', '.pdf', "Custom"]
    
    # Create a small window to display the count
    display_window = Tk()
    display_window.geometry("100x150")
    display_window.title("File Count")

    # Extension selection
    extension_menu = OptionMenu(display_window, monitor.extension_var, *common_extensions)
    extension_menu.pack()

    count_label = Label(display_window, text="0", font=("Helvetica", 55))
    count_label.pack(expand=True)

    def update_folder():
        monitor.select_folder()

    select_folder_button = Button(display_window, text="Select Folder", command=update_folder)
    select_folder_button.pack()

    # Start monitoring the folder
    display_window.after(0, monitor.update_label, count_label)

    # Start the tkinter main loop
    display_window.mainloop()
