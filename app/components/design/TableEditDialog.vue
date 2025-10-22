<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

// ------------------------
// Props и Emits
// ------------------------
const props = defineProps<{
  modelValue: boolean
  selectedTable: any
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'save', data: any): void
}>()

// ------------------------
// Локальное состояние
// ------------------------
const localTable = ref<any>(null)

watch(
  () => props.selectedTable,
  (val) => {
    // создаём глубокую копию, чтобы редактировать безопасно
    localTable.value = val ? JSON.parse(JSON.stringify(val)) : null
  },
  { immediate: true }
)

function closeDialog() {
  emits('update:modelValue', false)
}

function saveChanges() {
  if (!localTable.value) return
  emits('save', localTable.value)
  closeDialog()
}
</script>

<template>
  <Dialog v-model:open="props.modelValue" @update:open="emits('update:modelValue', $event)">
    <DialogContent class="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Редактирование таблицы</DialogTitle>
        <DialogDescription>
          Измените имя таблицы, типы колонок и посмотрите команды для Laravel / SQL.
        </DialogDescription>
      </DialogHeader>

      <div v-if="localTable">
        <Tabs default-value="edit">
          <TabsList class="grid grid-cols-2 mb-4">
            <TabsTrigger value="edit">🛠️ Редактировать</TabsTrigger>
            <TabsTrigger value="commands">💻 Команды</TabsTrigger>
          </TabsList>

          <!-- 🛠️ Редактирование -->
          <TabsContent value="edit">
            <div class="space-y-4">
              <div>
                <label class="text-sm text-gray-600">Имя таблицы</label>
                <Input v-model="localTable.label" />
              </div>

              <div>
                <label class="text-sm text-gray-600">Колонки</label>
                <div class="space-y-2">
                  <div
                    v-for="(col, i) in localTable.columns"
                    :key="i"
                    class="grid grid-cols-3 gap-2 items-center"
                  >
                    <Input v-model="localTable.columns[i].name" placeholder="Название" />

                    <Select v-model="localTable.columns[i].type">
                      <SelectTrigger>
                        <SelectValue placeholder="Тип" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="int">int</SelectItem>
                        <SelectItem value="varchar">varchar</SelectItem>
                        <SelectItem value="text">text</SelectItem>
                        <SelectItem value="decimal">decimal</SelectItem>
                        <SelectItem value="timestamp">timestamp</SelectItem>
                        <SelectItem value="boolean">boolean</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input
                      v-if="['varchar','decimal'].includes(localTable.columns[i].type)"
                      v-model="localTable.columns[i].length"
                      placeholder="Длина"
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <!-- 💻 Команды -->
          <TabsContent value="commands">
            <div class="bg-gray-50 border rounded-lg p-3 text-xs font-mono text-gray-700 space-y-3">
              <div>
                <strong>🧱 Laravel migration:</strong>
                <pre class="bg-white rounded p-2 mt-1 overflow-auto">
php artisan make:migration create_{{ localTable.label.toLowerCase() }}_table
                </pre>
              </div>

              <div>
                <strong>📦 Filament resource:</strong>
                <pre class="bg-white rounded p-2 mt-1 overflow-auto">
php artisan make:filament-resource {{ localTable.label.charAt(0).toUpperCase() + localTable.label.slice(1) }}
                </pre>
              </div>

              <div>
                <strong>🗄️ SQL команда:</strong>
                <pre class="bg-white rounded p-2 mt-1 overflow-auto">
CREATE TABLE IF NOT EXISTS {{ localTable.label }} (
{{ localTable.columns.map(c => `  ${c.name} ${c.type}${c.length ? '(' + c.length + ')' : ''}`).join(',\n') }}
);
                </pre>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button @click="saveChanges">Сохранить</Button>
        </DialogFooter>
      </div>
    </DialogContent>
  </Dialog>
</template>
