# The Breakery Print Server

Node.js print server for thermal printer communication in the POS system.

## Quick Start

```bash
# Install dependencies
npm install

# Run in development mode (mock printers)
npm run dev

# Test the server
npm test
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/status` | All printer status |
| GET | `/status/:printer` | Specific printer status |
| POST | `/print` | Generic print (from Edge Function) |
| POST | `/print/receipt` | Print customer receipt |
| POST | `/print/kitchen` | Print kitchen ticket |
| POST | `/print/barista` | Print barista ticket |
| POST | `/print/display` | Print display ticket |
| POST | `/print/test` | Test print |
| POST | `/drawer/open` | Open cash drawer |

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
# Server
PORT=3001
HOST=0.0.0.0

# Printer Types: mock, usb, network
RECEIPT_PRINTER_TYPE=mock    # Use 'usb' for real USB printer
BARISTA_PRINTER_TYPE=mock    # Use 'network' for real network printer
KITCHEN_PRINTER_TYPE=mock
DISPLAY_PRINTER_TYPE=mock

# Network printer IPs
BARISTA_PRINTER_IP=192.168.1.52
KITCHEN_PRINTER_IP=192.168.1.53
DISPLAY_PRINTER_IP=192.168.1.54
```

## Printer Setup

### USB Printer (Receipt)
1. Install USB package: `npm install usb`
2. Set `RECEIPT_PRINTER_TYPE=usb`
3. Configure VID/PID for your Epson printer

### Network Printers
1. Set `*_PRINTER_TYPE=network`
2. Configure IP addresses
3. Ensure port 9100 is accessible

## Production (Linux)

```bash
# Install as systemd service
sudo cp print-server.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable print-server
sudo systemctl start print-server
```

## Testing

```bash
# Test health
curl http://localhost:3001/health

# Test printer status
curl http://localhost:3001/status

# Send test print
curl -X POST http://localhost:3001/print/test -H "Content-Type: application/json" -d "{\"printer\":\"receipt\"}"
```
