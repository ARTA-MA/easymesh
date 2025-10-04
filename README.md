# EasyMesh

EasyMesh is a cross-platform file transfer application that enables fast and secure transfers between devices on the same local network using WebRTC technology.

## Features

- ⚡ **Blazing Fast Transfers**: Utilizes WebRTC for peer-to-peer connections, bypassing server bottlenecks
- 🌐 **Cross-Platform**: Works seamlessly between PC, mobile devices, and tablets
- 🔒 **Secure**: Direct device-to-device transfers with no intermediaries
- 📱 **Easy to Use**: Simple QR code pairing between devices
- 📁 **Large File Support**: Optimized for transferring large files with memory-efficient streaming
- 💬 **Built-in Chat**: Real-time text messaging between connected devices
- 🖥️ **Responsive UI**: Modern interface that works on all device sizes

## How It Works

1. Start a session on your PC
2. Scan the QR code with your mobile device
3. Send files and messages instantly over a direct WebRTC connection

## Installation

### Windows

1. Download the latest release from the [Releases](https://github.com/ARTA-MA/easymesh/releases) page
2. Run the `easymesh.exe` file
3. Allow network access when prompted by Windows Firewall
4. The application will automatically open in your browser

### Building from Source

#### Prerequisites
- Python 3.8+
- Node.js 18+
- Git

#### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/ARTA-MA/easymesh.git
   cd easymesh
   ```

2. Set up the backend:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r backend/requirements.txt
   ```

3. Set up the frontend:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. Build the application:
   ```bash
   # Windows
   .\build-windows-easymesh.bat
   
   # The executable will be created in the dist/ directory
   ```

## Usage

After starting the application, it will automatically open in your default browser. You can:

1. Click "Start New Session" to create a new transfer session
2. Scan the QR code from another device to connect
3. Drag and drop files to send them
4. Use the chat interface to send text messages

## Development

To run the development servers:

```bash
# Start backend server
cd backend
python run_local.py

# In another terminal, start frontend development server
cd frontend
npm start
```

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.