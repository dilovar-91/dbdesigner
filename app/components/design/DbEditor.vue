<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount } from 'vue'
import { useDbParser } from '~/composables/useDbParser'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits(['update:modelValue'])
const editorEl = ref<HTMLDivElement | null>(null)
let editor: any = null
onMounted(async () => {
  if (import.meta.server) return
  const monaco = await import('monaco-editor')

  const el = editorEl.value!
  el.setAttribute('tabindex', '0')
  el.style.userSelect = 'text'

  editor = monaco.editor.create(el, {
    value: props.modelValue,
    language: 'sql',
    theme: 'vs-dark',
    automaticLayout: true,
    fontSize: 14,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    insertSpaces: true,
    detectIndentation: false,
  })

  let isTyping = false
  editor.onDidChangeModelContent(() => {
    if (isTyping) return
    isTyping = true
    const val = editor.getValue()
    emit('update:modelValue', val)
    setTimeout(() => (isTyping = false), 0)
  })

  editor.addCommand(
  monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyA,
  () => {
    console.log('1235')
    editor.getAction('selectAll').run()
}
)


onMounted(async () => {
  const monaco = await import('monaco-editor')
  editor = monaco.editor.create(editorContainer.value, {
    value: 'console.log("hello");',
    language: 'javascript'
  })
})

// после создания editor
// ✅ Ключевое исправление: останавливаем всплытие НА САМОМ КОРНЕ editorEl
  const stopPropagation = (e: KeyboardEvent) => {
    // Позволяем Monaco обработать событие, но не даём ему всплыть к Vue Flow
    if (
      e.key === ' ' ||
      (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a' ||
      ['Backspace','Delete','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','PageUp','PageDown','Tab','Enter'].includes(e.key)
    ) {
      e.stopPropagation()
    }
  }

  // Добавляем на editorEl с capture: true — чтобы перехватить ДО внешних обработчиков
  el.addEventListener('keydown', stopPropagation, { capture: true })


watch(() => props.modelValue, (val) => {
  if (!editor) return
  const current = editor.getValue()
  if (val !== current) {
    const pos = editor.getPosition()
    editor.setValue(val)
    if (pos) editor.setPosition(pos)
  }
})




})

function validateSQL(sql: string, monaco: any) {
  const { errors } = useDbParser(sql)
  const model = editor?.getModel()
  if (!model) return
  monaco.editor.setModelMarkers(model, 'sql', errors.map(e => ({
    startLineNumber: e.line,
    startColumn: e.column,
    endLineNumber: e.line,
    endColumn: e.column + 1,
    message: e.message,
    severity: monaco.MarkerSeverity.Error,
  })))


  
}

onBeforeUnmount(() => editor?.dispose())






</script>

<template>
  <!-- ✅ tabindex и aria-role обязательны -->
  <div
    ref="editorEl"
    role="textbox"
    tabindex="0"
    class="h-full w-full border rounded-lg shadow-inner"
  />
</template>

<style scoped>
.monaco-editor,
.monaco-editor * {
  user-select: text !important;
}
</style>
