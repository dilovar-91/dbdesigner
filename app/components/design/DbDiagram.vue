<script setup lang="ts">
import { ref, computed } from 'vue'
import { VueFlow, Handle, Position } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import '@vue-flow/core/dist/style.css'

import { Button } from '@/components/ui/button'
import TableEditDialog from '@/components/design/TableEditDialog.vue'
import { useDiagramExports } from '@/composables/useDiagramExports'

const props = defineProps<{
  schema: Array<{ name: string; columns: string[] }>
}>()

const selectedTable = ref<any>(null)
const isDialogOpen = ref(false)
const diagramRef = ref<HTMLElement | null>(null)

// Positions
const nodePos = ref<Record<string, { x: number; y: number }>>(
  JSON.parse(localStorage.getItem('erd_node_pos') || '{}')
)

// ------------------------
// Nodes + Edges
// ------------------------
const nodes = computed(() =>
  props.schema.map((table, i) => {
    const saved = nodePos.value[table.name]
    const pos = saved ?? { x: (i % 4) * 350, y: Math.floor(i / 4) * 300 }

    const cols = table.columns.map((col) => {
      const m = col.match(/(\w+)\s+\w+\s+>\s+(\w+)\.(\w+)/)
      const isFk = !!m
      const name = isFk ? m![1] : col.split(' ')[0]
      const refTable = isFk ? m![2] : null
      const refCol = isFk ? m![3] : null
      return { name, isFk, refTable, refCol }
    })

    return {
      id: table.name,
      position: pos,
      type: 'tableNode',
      data: { label: table.name, columns: cols },
    }
  })
)

const edges = computed(() => {
  const result: any[] = []
  for (const table of props.schema) {
    for (const line of table.columns) {
      const match = line.match(/(\w+)\s+\w+\s+>\s+(\w+)\.(\w+)/)
      if (match) {
        const [_, col, refTable] = match
        result.push({
          id: `${table.name}-${col}`,
          source: table.name,
          target: refTable,
          label: '1→N',
          markerEnd: 'arrowclosed',
          style: { strokeWidth: 2 },
          animated: true,
        })
      }
    }
  }
  return result
})

// ------------------------
// Экспортные функции
// ------------------------
const { exportSQL, exportPNG, exportLaravelMigration, exportFilamentResources } =
  useDiagramExports(props.schema, diagramRef.value)

// ------------------------
// Обработчики событий
// ------------------------
function onNodeClick(_: any, node: any) {
  selectedTable.value = JSON.parse(JSON.stringify(node.data))
  isDialogOpen.value = true
}

function handleSave(updatedTable: any) {
  alert(`Изменения сохранены для таблицы: ${updatedTable.label}`)
}
</script>

<template>
  <div class="relative w-full h-full bg-muted rounded-xl overflow-hidden">
    <!-- Кнопки экспорта -->
    <div class="absolute top-3 right-3 z-50 flex gap-2">
      <Button size="sm" variant="outline" @click="exportSQL">Export SQL</Button>
      <Button size="sm" variant="outline" @click="exportPNG">Export PNG</Button>
      <Button size="sm" variant="outline" @click="exportLaravelMigration">Export Migrations</Button>
      <Button size="sm" variant="outline" @click="exportFilamentResources">Export Filament</Button>
    </div>

    <!-- Диаграмма -->
    <div ref="diagramRef" class="w-full h-full">
      <VueFlow
        :nodes="nodes"
        :edges="edges"
        fit-view-on-init
        :pan-on-drag="true"
        :zoom-on-scroll="true"
        :zoom-on-pinch="true"
        @node-click="onNodeClick"
      >
        <template #node-tableNode="{ data }">
          <div class="bg-white border shadow-lg rounded-xl p-2 w-64 cursor-pointer hover:border-primary transition">
            <h3 class="font-semibold text-center text-primary mb-2">{{ data.label }}</h3>
            <ul class="text-xs text-gray-700 space-y-0.5 relative">
              <li
                v-for="col in data.columns"
                :key="col.name"
                class="flex items-center justify-between border-b border-gray-100 py-0.5 relative"
              >
                <span>{{ col.name }}</span>
                <span v-if="col.isFk" class="text-blue-500 text-[10px]">🔗</span>

                <Handle
                  v-if="col.isFk"
                  :id="`${data.label}.${col.name}`"
                  type="source"
                  :position="Position.Right"
                  class="!bg-blue-400 !w-2 !h-2"
                />

                <Handle
                  v-else-if="col.name === 'id'"
                  :id="`${data.label}.${col.name}`"
                  type="target"
                  :position="Position.Left"
                  class="!bg-gray-400 !w-2 !h-2"
                />
              </li>
            </ul>
          </div>
        </template>

        <Background pattern-color="#e2e8f0" gap="16" />
        <MiniMap />
        <Controls />
      </VueFlow>
    </div>

    <!-- Диалог -->
    <TableEditDialog
      v-model="isDialogOpen"
      :selected-table="selectedTable"
      @save="handleSave"
    />
  </div>
</template>
