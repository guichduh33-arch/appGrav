# Architecture - Print Server (Node.js/Express)

*Généré le 2026-01-26 - Scan Exhaustif*

## Vue d'Ensemble

Serveur d'impression local pour imprimantes thermiques (tickets, cuisine, barista). Communique avec l'application principale via HTTP sur le réseau local.

## Stack Technique

| Composant | Technologie | Version |
|-----------|-------------|---------|
| Runtime | Node.js | 18+ |
| Framework | Express | 4.x |
| Logging | Winston | 3.x |
| USB/Serial | node-escpos | 3.x |

## Architecture

```
┌────────────────────────────────────────────────────────┐
│                    MAIN APP (React)                     │
│                                                         │
│  Commande créée → Print Service → HTTP Request         │
└────────────────────────────┬───────────────────────────┘
                             │
                             │ HTTP POST (localhost:3001)
                             ▼
┌────────────────────────────────────────────────────────┐
│                    PRINT SERVER                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                 Express App                      │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐   │   │
│  │  │  /print   │  │  /status  │  │  /drawer  │   │   │
│  │  │  routes   │  │  routes   │  │  routes   │   │   │
│  │  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘   │   │
│  └────────┼──────────────┼──────────────┼─────────┘   │
│           │              │              │              │
│  ┌────────┴──────────────┴──────────────┴─────────┐   │
│  │                PrinterService                   │   │
│  │  • Gestion connexions USB/réseau               │   │
│  │  • Formatage ESC/POS                           │   │
│  │  • File d'attente impression                   │   │
│  └────────────────────────┬───────────────────────┘   │
└───────────────────────────┼───────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
      ┌──────────┐   ┌──────────┐   ┌──────────┐
      │ Receipt  │   │ Kitchen  │   │  Cash    │
      │ Printer  │   │ Printer  │   │ Drawer   │
      └──────────┘   └──────────┘   └──────────┘
```

## Structure des Fichiers

```
print-server/
├── src/
│   ├── index.js              # Point d'entrée Express
│   ├── routes/
│   │   ├── print.js          # Routes /print/*
│   │   ├── status.js         # Route /status
│   │   └── drawer.js         # Route /drawer
│   ├── services/
│   │   └── PrinterService.js # Gestion imprimantes
│   └── utils/
│       └── logger.js         # Winston configuration
├── logs/                     # Fichiers de log (rotation)
├── package.json
├── .env.example
└── print-server.service      # Fichier systemd
```

## API Endpoints

### GET /health

Vérification santé du serveur.

**Response:**
```json
{
  "status": "healthy",
  "uptime": 3600,
  "version": "1.0.0"
}
```

### GET /status

Statut de toutes les imprimantes configurées.

**Response:**
```json
{
  "printers": [
    {
      "id": "receipt",
      "name": "Receipt Printer",
      "type": "usb",
      "status": "connected",
      "lastPrint": "2026-01-26T10:30:00Z"
    },
    {
      "id": "kitchen",
      "name": "Kitchen Printer",
      "type": "network",
      "ip": "192.168.1.100",
      "status": "connected"
    }
  ]
}
```

### POST /print/receipt

Impression ticket de caisse.

**Request:**
```json
{
  "orderId": "uuid",
  "orderNumber": "001",
  "items": [
    {
      "name": "Croissant",
      "quantity": 2,
      "price": 15000,
      "modifiers": ["Extra Butter"]
    }
  ],
  "subtotal": 30000,
  "tax": 2727,
  "total": 30000,
  "paymentMethod": "cash",
  "cashReceived": 50000,
  "change": 20000,
  "timestamp": "2026-01-26T10:30:00Z",
  "cashier": "Marie"
}
```

**Response:**
```json
{
  "success": true,
  "printerId": "receipt",
  "jobId": "job-123"
}
```

### POST /print/kitchen

Impression bon de cuisine.

**Request:**
```json
{
  "orderId": "uuid",
  "orderNumber": "001",
  "table": "Table 5",
  "items": [
    {
      "name": "Sandwich Jambon",
      "quantity": 1,
      "modifiers": ["Sans cornichons"],
      "notes": "Urgent"
    }
  ],
  "timestamp": "2026-01-26T10:30:00Z",
  "station": "kitchen"
}
```

### POST /print/barista

Impression bon barista (boissons).

**Request:**
```json
{
  "orderId": "uuid",
  "orderNumber": "001",
  "items": [
    {
      "name": "Café Latte",
      "quantity": 2,
      "modifiers": ["Lait d'avoine", "Extra shot"]
    }
  ],
  "timestamp": "2026-01-26T10:30:00Z"
}
```

### POST /drawer/open

Ouverture tiroir-caisse.

**Request:**
```json
{
  "reason": "cash_payment",
  "userId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "timestamp": "2026-01-26T10:30:00Z"
}
```

## PrinterService

### Configuration

```javascript
// .env
RECEIPT_PRINTER_TYPE=usb
RECEIPT_PRINTER_VID=0x04b8
RECEIPT_PRINTER_PID=0x0202

KITCHEN_PRINTER_TYPE=network
KITCHEN_PRINTER_IP=192.168.1.100
KITCHEN_PRINTER_PORT=9100

BARISTA_PRINTER_TYPE=network
BARISTA_PRINTER_IP=192.168.1.101
BARISTA_PRINTER_PORT=9100
```

### Méthodes Principales

```javascript
class PrinterService {
  // Initialisation connexions
  async initialize()

  // Statut imprimantes
  getStatus(): PrinterStatus[]

  // Impression générique
  async print(printerId: string, content: PrintJob): Promise<void>

  // Formatage ESC/POS
  formatReceipt(data: ReceiptData): Buffer
  formatKitchenOrder(data: KitchenData): Buffer

  // Tiroir-caisse
  async openDrawer(): Promise<void>
}
```

### Formatage ESC/POS

```javascript
// Exemple formatage ticket
formatReceipt(data) {
  const encoder = new EscPosEncoder()

  return encoder
    .initialize()
    .align('center')
    .bold(true)
    .text('THE BREAKERY')
    .bold(false)
    .newline()
    .align('left')
    .text(`Order #${data.orderNumber}`)
    .text(`Date: ${formatDate(data.timestamp)}`)
    .newline()
    .line('-')
    // Items
    .text(formatItems(data.items))
    .line('-')
    .align('right')
    .text(`Subtotal: ${formatCurrency(data.subtotal)}`)
    .text(`Tax (10%): ${formatCurrency(data.tax)}`)
    .bold(true)
    .text(`TOTAL: ${formatCurrency(data.total)}`)
    .bold(false)
    .newline()
    .align('center')
    .text('Merci de votre visite!')
    .cut()
    .encode()
}
```

## Logging

### Configuration Winston

```javascript
// src/utils/logger.js
const winston = require('winston')
const DailyRotateFile = require('winston-daily-rotate-file')

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new DailyRotateFile({
      filename: 'logs/print-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d'
    }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
})
```

### Niveaux de Log

| Niveau | Usage |
|--------|-------|
| error | Erreurs d'impression, connexion perdue |
| warn | Imprimante hors papier, file pleine |
| info | Jobs d'impression réussis |
| debug | Détails ESC/POS, données brutes |

## Déploiement

### Systemd Service

```ini
# /etc/systemd/system/print-server.service
[Unit]
Description=AppGrav Print Server
After=network.target

[Service]
Type=simple
User=appgrav
WorkingDirectory=/opt/appgrav/print-server
ExecStart=/usr/bin/node src/index.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

### Commandes

```bash
# Installer
sudo cp print-server.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable print-server

# Démarrer
sudo systemctl start print-server

# Logs
sudo journalctl -u print-server -f
```

## Sécurité

### Réseau Local

- Le serveur écoute sur `0.0.0.0:3001` (toutes les interfaces)
- Destiné au réseau local uniquement
- Pas d'authentification (confiance réseau)
- CORS permissif pour accès depuis navigateurs

### Recommandations

1. Firewall : bloquer port 3001 depuis l'extérieur
2. Réseau dédié pour les terminaux POS
3. Monitoring des logs pour anomalies

## Gestion des Erreurs

### Retry Logic

```javascript
async printWithRetry(printerId, content, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await this.print(printerId, content)
      return { success: true }
    } catch (error) {
      logger.warn(`Print attempt ${attempt} failed`, { error, printerId })
      if (attempt === maxRetries) {
        throw error
      }
      await sleep(1000 * attempt)  // Backoff exponentiel
    }
  }
}
```

### Codes d'Erreur

| Code | Description | Action |
|------|-------------|--------|
| `PRINTER_OFFLINE` | Imprimante déconnectée | Vérifier connexion USB/réseau |
| `PAPER_OUT` | Plus de papier | Recharger le rouleau |
| `PRINT_FAILED` | Échec impression | Réessayer ou vérifier données |
| `DRAWER_LOCKED` | Tiroir bloqué | Vérifier mécanisme |
