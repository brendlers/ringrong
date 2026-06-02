# 🎮 Ring Rong - Interaktives Kreisbogen-Spiel

Ein dynamisches Browser-Spiel mit kreisförmigen Paddles, Ballphysik und Trail-Visualisierung.

[Hier probieren!](https://brendlers.github.io/ringrong/)


## 🎯 Spielprinzip

Ring Rong ist ein einzigartiges Pong-ähnliches Spiel, das in einem Kreis gespielt wird:
- **Zwei Spieler** (A und B) kontrollieren Kreisbogen-Paddles
- Ein **Ball** bewegt sich im Kreis und prallt von den Paddles ab
- **Paddle-Breite** hängt von verbleibenden Leben ab (10° pro Leben)
- **Rote Paddle-Enden** bieten spezielle Reflexionseffekte
- **Trail-System** zeichnet die Ballspur in verschiedenen Farben

## 🎮 Steuerung

### **Maus-Steuerung**
- **Mausbewegung**: Steuert die Position beider Paddles
  - **X-Achse**: Bestimmt den Startwinkel von Paddle A
  - **Y-Achse**: Bestimmt den Startwinkel von Paddle B
- **Klick ins SVG**: Spiel starten/neustarten

### **Tastatur-Steuerung**
| Taste | Spieler | Funktion |
|-------|---------|----------|
| **A / D** | Spieler A | Paddle links / rechts drehen |
| **← / →** | Spieler B | Paddle links / rechts drehen |
| **Leertaste** | – | 🚀 Ballgeschwindigkeit +50% |
| **P** | – | ⏸️ Pause ein/aus |
| **S** | – | 💾 SVG mit Trails speichern |

### **Gamepad-Steuerung**

#### Ein Controller
| Eingabe | Funktion |
|---------|----------|
| **Linker Stick** | Spieler A – Stick-Richtung = Paddle-Position (oben/rechts/unten/links) |
| **Rechter Stick** | Spieler B – Stick-Richtung = Paddle-Position |
| **Start** | Spiel starten / Pause ein\|aus / Neustarten |
| **A** | 💾 SVG mit Trails speichern |

#### Zwei Controller
| Eingabe | Funktion |
|---------|----------|
| **Controller 1 – Linker Stick** | Spieler A |
| **Controller 2 – Linker Stick** | Spieler B |
| **Start (beliebiger Controller)** | Spiel starten / Pause / Neustarten |
| **A (beliebiger Controller)** | 💾 SVG speichern |

> **Stick-Logik**: Zeigt der Stick nach oben → Paddle ist oben; Stick losgelassen → Paddle bleibt an letzter Position stehen.

## 🏆 Spielregeln

### **Leben-System**
- Jeder Spieler startet mit **5 Leben**
- **Leben verlieren**: Ball erreicht den äußeren Kreisrand
- **Paddle-Breite**: 10° × verbleibende Leben (minimum 1°)
- **Spielende**: Ein Spieler hat 0 Leben

### **Kollisionen & Physik**
- **Normale Paddle-Reflexion**: Standard-Ballabprall
- **Paddle-Enden (rot)**: 
  - 30% Geschwindigkeitsboost
  - Zufällige Spin-Effekte für mehr Dynamik
- **Rahmen-Kollision**: Dämpfung (70%) + Lebensverlust
- **Mindestgeschwindigkeit**: Ball bleibt immer in Bewegung

## 🎨 Trail-System

### **Ballspur-Visualisierung**
- **Aktuelle Spur**: Zeigt den aktuellen Ballweg in Echtzeit
- **Historische Spuren**: Vergangene Spiele bleiben sichtbar
- **Farbwechsel**: Jedes neue Spiel bekommt eine neue Spurfarbe
- **Verblassung**: Alte Spuren werden transparenter dargestellt

### **Trail-Farben** (Reihenfolge)
1. 🟢 Grün (oklch(1 1 0))
2. 🔵 Cyan (oklch(1 1 180))
3. 🟡 Gelb (oklch(1 1 90))
4. 🟣 Magenta (oklch(1 1 270))
5. 🟠 Orange (oklch(1 0.5 0))
6. 🔷 Hellblau (oklch(1 0.5 180))
7. 🟨 Hellgelb (oklch(1 0.5 90))
8. 🟪 Hellmagenta (oklch(1 0.5 270))

## 💾 SVG-Export

### **S-Taste: Trail-Kunstwerke speichern**
- **Was wird gespeichert**: Komplettes SVG mit allen Trail-Spuren
- **Dateiname**: `ringrong-trails-YYYY-MM-DDTHH-MM-SS.svg`
- **Metadaten**: Zeitstempel, Spielstand, Trail-Anzahl als SVG-Kommentare
- **Format**: Eigenständige SVG-Datei (in Vektorgrafik-Programmen öffenbar)

### **Verwendung der exportierten SVGs**
- Öffnen in Inkscape, Adobe Illustrator, etc.
- Als Vektorgrafik weiterbearbeiten
- Drucken oder in andere Projekte einbinden
- Sammlung von Trail-Kunstwerken erstellen

## 🚀 Technische Details

### **Architektur**
- **Dynamisches Loading**: SVG wird zur Laufzeit geladen
- **Modularer Aufbau**: Titel, SVG und HUD werden programmgesteuert eingefügt
- **Event-basiert**: Alle Interaktionen über Event-Listener

### **Dateien**
- `index.html`: Minimal-Framework mit game-container
- `game.svg`: Spielfeld-SVG (extern geladen)
- `style.css`: Styling mit CSS-Variablen
- `main.js`: Komplette Spiellogik und Physik

### **Features**
- ✅ Responsive Design
- ✅ Echtzeit-Ballphysik
- ✅ Dynamische Paddle-Größen
- ✅ Multi-Trail-Visualisierung  
- ✅ Pause-Funktion
- ✅ SVG-Export
- ✅ Persistente Trail-Historie

## 🎯 Spieltipps

1. **Paddle-Positionierung**: Nutzen Sie die roten Enden für Überraschungseffekte
2. **Speed Boosts**: Leertaste strategisch einsetzen für schwierige Situationen
3. **Trail-Kunst**: Experimentieren Sie mit verschiedenen Bewegungsmustern
4. **Speichern**: Interessante Trail-Kombinationen mit S-Taste sichern

---

**Viel Spaß beim Spielen! 🎮✨**
