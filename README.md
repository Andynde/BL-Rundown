# BL Rundown Studio

Eine moderne, professionelle Rundown-Management-Anwendung für Broadcast- und Live-Produktionen.

## 🌐 Live Demo

**[https://andynde.github.io/BL-Rundown/](https://andynde.github.io/BL-Rundown/)**

## 📱 Als App installieren

Die App kann als Progressive Web App (PWA) auf deinem Gerät installiert werden:

- **Android**: Chrome → Menü → "Zum Startbildschirm hinzufügen"
- **iOS**: Safari → Teilen → "Zum Home-Bildschirm"
- **Desktop**: Chrome/Edge → Install-Button in der Adressleiste

Siehe [INSTALLATION.md](INSTALLATION.md) für detaillierte Anweisungen.

## 🎯 Features

### Moderne Benutzeroberfläche
- **Frisches, modernes Design** inspiriert von professionellen Tools wie RundownStudio, OpenMedia und Octopus Rundown
- **Dark Mode** für komfortables Arbeiten bei wenig Licht
- **Responsive Design** funktioniert auf Desktop, Tablet und Mobilgeräten
- **Smooth Animations** für eine flüssige Benutzererfahrung

### Element-Management
- **Vordefinierte Elementtypen**: Story, VT, Live, Pause, Intro
- **Anpassbare Farben** für jeden Elementtyp
- **Einfaches Hinzufügen**: Klick auf ein Element in der Seitenleiste erstellt sofort eine neue Zeile
- **Einstellungsmenü** zum Verwalten und Erstellen neuer Elementtypen
- **Icon-Auswahl** aus über 40 Broadcast-spezifischen Icons

### Rundown-Funktionen
- **Live-Countdown** für jede Zeile
- **Status-Anzeigen**: Anstehend, Aktiv, Preview, Fertig
- **Editierbare Felder**: Dauer, Beschreibung, Notizen
- **Drag & Drop**: Zeilen und Spalten verschieben
- **Spalten anpassen**: Eigene Spalten hinzufügen und anordnen
- **Auto-Save**: Alle Änderungen werden automatisch gespeichert

### Countdown-System
- **Endzeit-Eingabe** für präzise Planung (optional)
- **Automatischer Countdown** für aktive Zeile
- **Preview-Funktion**: Nächste Zeile vorauswählen (Leertaste zum Übernehmen)
- **Farbwarnungen**: 
  - Gelb bei < 30 Sekunden
  - Rot bei ≤ 10 Sekunden
- **Start/Pause/Reset** Kontrollen
- **Persistenz**: Timer-Status bleibt nach Neustart erhalten

### Progressive Web App (PWA)
- **Installierbar** auf allen Geräten
- **Offline-Funktionalität** - funktioniert ohne Internet
- **App-like Experience** - Vollbild ohne Browser-UI
- **Optimiert für Android Portrait-Modus**
- **Safe Area Support** für Geräte mit Notch

### Datenpersistenz
- **LocalStorage**: Alle Daten bleiben auch nach Browser-Neustart erhalten
- **Auto-Save Indikator**: Visuelles Feedback beim Speichern
- **Rundown-Name** wird gespeichert
- **Timer-Wiederherstellung**: Läuft nach Neustart weiter

## 🚀 Verwendung

### Erste Schritte

1. **Öffne die App**: [https://andynde.github.io/BL-Rundown/](https://andynde.github.io/BL-Rundown/)
2. **Gib einen Rundown-Namen** ein (oben links)
3. **Klicke auf ein Element** in der Seitenleiste, um eine Zeile hinzuzufügen
4. **Bearbeite die Felder** durch Klicken (Dauer, Beschreibung, Notizen)

### Rundown starten

1. **Optional: Gib eine Endzeit** ein (oben rechts)
2. **Klicke auf "Start"** um den Countdown zu beginnen
3. Die aktive Zeile wird **grün hervorgehoben**
4. Der Countdown läuft automatisch durch alle Zeilen

### Preview-Funktion (während Timer läuft)

- **Einfacher Klick** auf eine Zeile → Preview (gelb markiert)
- **Leertaste drücken** → Springe zur Preview-Zeile
- **Doppelklick** auf eine Zeile → Direkt zu dieser Zeile springen

### Elementtypen verwalten

1. **Klicke auf das Zahnrad-Symbol** (⚙️) in der Seitenleiste
2. Im Einstellungsmenü kannst du:
   - Neue Elementtypen hinzufügen
   - Farben anpassen
   - Icons auswählen
   - Standard-Dauern festlegen
   - Typen löschen
3. **Klicke auf "Speichern"** um die Änderungen zu übernehmen

### Zeilen verwalten

- **Neue Zeile hinzufügen**: Klicke auf ein Element oder den ➕ Button unten rechts
- **Zeile verschieben**: Drag & Drop oder Pfeiltasten verwenden
- **Zeile löschen**: Hover über eine Zeile → Papierkorb-Symbol
- **Felder bearbeiten**: Direkt in die Zelle klicken und tippen

### Spalten verwalten

- **Spalten verschieben**: Drag & Drop am Spalten-Header
- **Spaltenbreite ändern**: Ziehe am Resizer rechts im Header
- **Eigene Spalte hinzufügen**: Button "Spalte hinzufügen" oben rechts
- **Spalte löschen**: ✕ Symbol im Custom-Spalten-Header

## 🎨 Elementtypen

### Standard-Typen

| Typ | Farbe | Icon | Standard-Dauer |
|-----|-------|------|----------------|
| Story | Blau | 📰 | 02:00 |
| VT | Lila | 🎥 | 01:30 |
| Live | Rot | 📡 | 03:00 |
| Pause | Orange | ☕ | 05:00 |
| Intro | Grün | ▶️ | 00:30 |

Du kannst diese anpassen oder eigene Typen erstellen!

## 💾 Datenspeicherung

Alle Daten werden im Browser's LocalStorage gespeichert:
- Rundown-Name
- Alle Zeilen mit Inhalt
- Elementtypen und Einstellungen
- Dark Mode Präferenz
- Spalten-Konfiguration
- Timer-Status

**Hinweis**: Daten bleiben nur im aktuellen Browser erhalten. Für Backup oder Sharing zwischen Geräten solltest du die Export-Funktion verwenden (geplant für zukünftige Version).

## ⌨️ Tastenkombinationen

- `Leertaste` - Preview-Zeile übernehmen (während Timer läuft)

Geplant für zukünftige Versionen:
- `Strg/Cmd + N` - Neue Zeile
- `Strg/Cmd + ,` - Einstellungen

## 🌙 Dark Mode

Aktiviere den Dark Mode in den Einstellungen für:
- Reduzierte Augenbelastung
- Bessere Sichtbarkeit bei wenig Licht
- Professionelles Aussehen

## 📱 Mobile Optimierung

Die App ist speziell für Android Portrait-Modus optimiert:
- **Kompakte Ansicht** mit versteckten unwichtigen Spalten
- **Touch-optimierte Bedienung**
- **Sidebar als Overlay** (öffnet sich über Einstellungen-Button)
- **Große Touch-Targets** für einfache Bedienung
- **Safe Area Support** für Geräte mit Notch

## 🔧 Technische Details

### Technologien
- **HTML5** - Struktur
- **CSS3** - Styling mit CSS Variables
- **Vanilla JavaScript** - Keine Frameworks benötigt
- **Font Awesome** - Icons
- **Google Fonts (Inter)** - Typografie
- **Service Worker** - Offline-Funktionalität
- **Web App Manifest** - PWA-Installation

### Browser-Kompatibilität
- Chrome/Edge 80+ (empfohlen)
- Firefox 90+
- Safari 11.3+
- Opera

### Dateien
- `index.html` - Hauptstruktur
- `styles.css` - Alle Styles und Animationen
- `script.js` - Gesamte Logik und Funktionalität
- `manifest.json` - PWA-Konfiguration
- `service-worker.js` - Offline-Funktionalität

## 🎯 Zukünftige Features

- [ ] Export/Import von Rundowns (JSON, CSV)
- [ ] Druckansicht
- [ ] Erweiterte Tastenkombinationen
- [ ] Mehrere Rundowns verwalten
- [ ] Vorlagen-System
- [ ] Notizen mit Rich Text
- [ ] Zeitplan-Visualisierung
- [ ] Push Notifications für Timer-Alerts
- [ ] Cloud-Sync (optional)

## 📚 Dokumentation

- [INSTALLATION.md](INSTALLATION.md) - Detaillierte Installations-Anleitung
- [PWA-FEATURES.md](PWA-FEATURES.md) - PWA-Features und technische Details

## 📄 Lizenz

Dieses Projekt ist für den persönlichen und kommerziellen Gebrauch frei verfügbar.

## 🤝 Beitragen

Feedback und Verbesserungsvorschläge sind willkommen!

## 🐛 Probleme melden

Bei Bugs oder Feature-Requests bitte ein Issue auf GitHub erstellen.

---

**Viel Erfolg mit deinen Produktionen! 🎬**

Entwickelt mit ❤️ für Broadcast-Profis
