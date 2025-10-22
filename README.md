# 🧩 Nuxt 4 DB Designer

A **visual database schema designer** built with **Nuxt 4**, **Vue Flow**, and **shadcn/ui** — inspired by [dbdiagram.io](https://dbdiagram.io) and [dbdesigner.net](https://dbdesigner.net).
It lets you define tables in SQL-like syntax, visualize relationships, and export Laravel migrations, Filament resources, or SQL scripts.

## 🚀 Features

- 🧠 **Monaco SQL Editor** — live syntax validation & schema parsing
- 🧾 **Visual ERD Diagram** — powered by Vue Flow, shows 1-1 / 1-N relations
- 🔗 **Foreign Key Detection** — connects columns like `user_id → users.id` automatically
- 🧱 **Editable Tables** — rename tables, change column types & lengths via dialog
- ⚙️ **Export Tools**
  - `.sql` schema (`CREATE TABLE IF NOT EXISTS…`)
  - Laravel migrations (.php ZIP)
  - Filament 4 resources (.php ZIP)
  - Diagram snapshot (.png)
- 🖱️ **Draggable Layout** — remembers table positions (localStorage)
- 🎨 **shadcn/ui integration** — dialogs, buttons, tabs, selects
- 🧭 **Nuxt 4 + Vite 5 ready** — zero-config, instant HMR

## 🛠️ Tech Stack

| Layer | Library |
|-------|----------|
| Framework | [Nuxt 4](https://nuxt.com) |
| Diagram Engine | [Vue Flow v1](https://vueflow.dev) |
| UI Components | [shadcn/ui for Vue](https://ui.shadcn.com) |
| Editor | [Monaco Editor](https://microsoft.github.io/monaco-editor) |
| Styling | [Tailwind CSS v3](https://tailwindcss.com) |
| Utilities | JSZip, FileSaver, html-to-image |

## 📦 Installation

```bash
# 1️⃣ Create a Nuxt 4 project
npm create nuxt@latest dbdesigner
cd dbdesigner

# 2️⃣ Install dependencies
npm install @vue-flow/core @vue-flow/background @vue-flow/minimap @vue-flow/controls
npm install monaco-editor jszip file-saver html-to-image
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 3️⃣ Add shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button dialog input tabs select
```

## 🧰 Development

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000)

## 🧩 Project Structure

```
app/
 ├─ components/
 │   ├─ design/
 │   │   ├─ DbEditor.vue      # Monaco SQL editor
 │   │   └─ DbDiagram.vue     # Vue Flow diagram
 │   └─ ui/…                  # shadcn/ui components
 ├─ pages/
 │   └─ index.vue             # Layout: editor + diagram (35 / 65)
 ├─ composables/
 │   └─ useDbParser.ts        # Simple SQL→schema parser
 └─ public/
     └─ icons/…
```

## 💾 Local Storage

User-arranged node positions are stored in:
```
localStorage['erd_node_pos']
```
so diagram layout persists across reloads.

## 🧱 Exports

| Command | Description | Output |
|----------|--------------|--------|
| **Export SQL** | Generate `CREATE TABLE IF NOT EXISTS` statements | `schema.sql` |
| **Export PNG** | Save current diagram snapshot | `diagram.png` |
| **Export Migrations** | Create Laravel migration files | `laravel_migrations.zip` |
| **Export Filament** | Generate Filament 4 resources | `filament_resources.zip` |

## 💡 Shortcuts / Tips

- Double-click a table → open edit dialog
- Drag tables to reposition (autosaved)
- Hover 🔗 icon = foreign key
- Handles on left/right edges = PK/FK connection points
- Smooth curved lines (`bezier`) for relationships

## ⚖️ License

MIT © 2025 — You’re free to use, modify, and share.
