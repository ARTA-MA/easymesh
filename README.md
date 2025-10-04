# EasyMesh

EasyMesh is a powerful application for seamless file transfers and device connectivity across your local network. It provides an intuitive interface for transferring files between devices, managing connections, and optimizing network performance.

## Features

- **Fast File Transfers**: Optimized multi-connection file transfer system with automatic chunking
- **Progress Tracking**: Real-time monitoring of file transfer progress
- **Automatic Retry**: Built-in retry mechanism with exponential backoff for reliable transfers
- **Memory Efficient**: Optimized memory usage during transfers
- **Cross-Platform**: Works across different operating systems and devices
- **Simple Interface**: User-friendly interface for easy navigation and operation

## Installation Guide

### Windows

1. **Download the Application**
   - Download the latest release from the [Releases](https://github.com/yourusername/easymesh/releases) page
   - Choose the `easymesh.exe` file from the latest release

2. **Run the Application**
   - Double-click the downloaded `easymesh.exe` file
   - If Windows SmartScreen appears, click "More info" and then "Run anyway"
   - Allow access through Windows Firewall when prompted (important for network connectivity)

3. **Verify Installation**
   - The application will start automatically and open in your default browser
   - The server runs on port 8001 by default

### Building from Source

If you prefer to build from source:

1. **Clone the Repository**
   ```
   git clone https://github.com/yourusername/easymesh.git
   cd easymesh
   ```

2. **Set Up Python Environment**
   ```
   python -m venv .venv
   .\.venv\Scripts\activate
   pip install -r backend\requirements.txt
   ```

3. **Build the Application**
   ```
   .\build-windows-easymesh.bat
   ```

4. **Run the Built Application**
   ```
   .\dist\easymesh.exe
   ```

## Connection Setup

### Connecting Devices

1. **Start the EasyMesh Application**
   - Run the application on your main device
   - Note the IP address displayed in the application (typically shown as http://192.168.x.x:8001)

2. **Connect from Other Devices**
   - On other devices (phones, tablets, computers), open a web browser
   - Enter the IP address and port (e.g., http://192.168.1.100:8001) in the address bar
   - You should now see the EasyMesh interface

3. **Verify Connection**
   - The connected device should appear in the devices list on the main interface
   - You can now begin transferring files between devices

### Troubleshooting Connection Issues

- Ensure all devices are on the same Wi-Fi network
- Check that Windows Firewall is allowing EasyMesh through (you can verify in Windows Security settings)
- Verify that no antivirus software is blocking the connection
- Try restarting the application if devices aren't appearing

## Usage Instructions

### File Transfers

1. **Sending Files**
   - Select the destination device from the devices list
   - Click "Send File" or drag and drop files onto the interface
   - Select the files you want to transfer
   - Click "Transfer" to begin the process
   - Monitor progress in the transfer status panel

2. **Receiving Files**
   - Files sent to your device will appear in the "Incoming Transfers" section
   - Accept the transfer when prompted
   - Files are saved to your Downloads folder by default

3. **Transfer Management**
   - View active transfers in the "Active Transfers" panel
   - Cancel transfers by clicking the "X" button next to a transfer
   - Retry failed transfers by clicking the "Retry" button

### Application Settings

1. **Accessing Settings**
   - Click the gear icon in the top-right corner
   - Adjust transfer settings, connection preferences, and application behavior

2. **Transfer Settings**
   - Configure maximum connections for parallel transfers
   - Set default save location for received files
   - Enable/disable automatic retry for failed transfers

3. **Network Settings**
   - Change the default port (requires application restart)
   - Configure connection timeout values
   - Set bandwidth limits if needed

## Application Workflow

1. **Startup Process**
   - Application starts the backend server
   - Web interface is launched in your default browser
   - Network discovery begins to find other devices

2. **Device Discovery**
   - EasyMesh automatically discovers other devices running the application on your network
   - Devices appear in the "Available Devices" list
   - Connection status is indicated by colored icons

3. **File Transfer Process**
   - When initiating a transfer, files are analyzed for optimal transfer strategy
   - Large files are automatically split into chunks for parallel transfer
   - Progress is tracked and displayed in real-time
   - Automatic retry occurs if connection issues arise

4. **Shutdown Process**
   - Closing the application window will prompt to confirm exit
   - Active transfers are completed or paused based on your preference
   - Server shuts down cleanly

## Advanced Features

### Command Line Options

EasyMesh supports several command line options:

```
easymesh.exe --port 8080  # Run on a specific port
easymesh.exe --no-browser # Don't open browser automatically
easymesh.exe --debug      # Enable debug logging
```

### Custom FTP Configuration

For advanced users, EasyMesh allows custom FTP configuration:

1. Navigate to Settings > Advanced
2. Configure custom FTP settings including:
   - Buffer sizes
   - Connection limits
   - Timeout values

## Support and Troubleshooting

If you encounter issues:

1. Check the application logs in `%APPDATA%\EasyMesh\logs`
2. Verify your network configuration
3. Ensure all devices are updated to the latest version
4. For persistent issues, please open an issue on the [GitHub repository](https://github.com/yourusername/easymesh/issues)

## License

EasyMesh is released under the MIT License. See the LICENSE file for details.
