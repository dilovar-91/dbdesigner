// composables/useDiagramExports.ts
import { toPng } from 'html-to-image'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

export function useDiagramExports(schema: any, diagramRef: HTMLElement | null) {
  // ------------------------
  // Export SQL
  // ------------------------
  function exportSQL() {
    let sql = ''
    for (const table of schema) {
      sql += `CREATE TABLE ${table.name} (\n`
      sql += table.columns.map((c: string) => `  ${c}`).join(',\n')
      sql += `\n);\n\n`
    }

    const blob = new Blob([sql], { type: 'text/sql' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'schema.sql'
    link.click()
  }

  // ------------------------
  // Export PNG
  // ------------------------
  async function exportPNG() {
    if (!diagramRef) return
    const dataUrl = await toPng(diagramRef, { backgroundColor: '#f9fafb' })
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = 'diagram.png'
    link.click()
  }

  // ------------------------
  // Export Laravel Migrations
  // ------------------------
  async function exportLaravelMigration() {
    const zip = new JSZip()
    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14)

    for (const table of schema) {
      const className =
        'Create' + table.name.charAt(0).toUpperCase() + table.name.slice(1) + 'Table'

      let content = `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('${table.name}', function (Blueprint $table) {
`

      for (const col of table.columns) {
        if (col.includes('pk')) content += `            $table->id();\n`
        else if (col.includes('varchar'))
          content += `            $table->string('${col.split(' ')[0]}');\n`
        else if (col.includes('text'))
          content += `            $table->text('${col.split(' ')[0]}');\n`
        else if (col.includes('timestamp'))
          content += `            $table->timestamp('${col.split(' ')[0]}')->nullable();\n`
        else if (col.includes('int'))
          content += `            $table->integer('${col.split(' ')[0]}');\n`
        else if (col.includes('decimal'))
          content += `            $table->decimal('${col.split(' ')[0]}', 10, 2);\n`
        else if (col.includes('boolean'))
          content += `            $table->boolean('${col.split(' ')[0]}');\n`
        else
          content += `            $table->string('${col.split(' ')[0]}');\n`
      }

      content += `        });
    }

    public function down(): void
    {
        Schema::dropIfExists('${table.name}');
    }
};
`

      zip.file(`${timestamp}_create_${table.name}_table.php`, content)
    }

    const blob = await zip.generateAsync({ type: 'blob' })
    saveAs(blob, 'laravel_migrations.zip')
  }

  // ------------------------
  // Export Filament Resources
  // ------------------------
  async function exportFilamentResources() {
    const zip = new JSZip()

    for (const table of schema) {
      const className =
        table.name.charAt(0).toUpperCase() + table.name.slice(1).replace(/s$/, '')
      const resourceClass = `${className}Resource`

      const resource = `<?php

namespace App\\Filament\\Resources;

use App\\Models\\${className};
use Filament\\Resources\\Resource;
use Filament\\Resources\\Form;
use Filament\\Resources\\Table;

class ${resourceClass} extends Resource
{
    protected static ?string $model = ${className}::class;

    public static function form(Form $form): Form
    {
        return $form->schema([
${table.columns
  .map((col: string) => `            TextInput::make('${col.split(' ')[0]}'),`)
  .join('\n')}
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([
${table.columns
  .map((col: string) => `            TextColumn::make('${col.split(' ')[0]}'),`)
  .join('\n')}
        ]);
    }
}
`

      zip.file(`${resourceClass}.php`, resource)
    }

    const blob = await zip.generateAsync({ type: 'blob' })
    saveAs(blob, 'filament_resources.zip')
  }

  return { exportSQL, exportPNG, exportLaravelMigration, exportFilamentResources }
}
