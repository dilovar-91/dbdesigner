export function useDbParser(sql: string) {
  const tableRegex = /(\w+)\s*\{([^}]+)\}/g
  const tables: any[] = []
  let match

  while ((match = tableRegex.exec(sql)) !== null) {
    const [, name, body] = match
    // НЕ тримим, просто очищаем \r и пропускаем пустые строки
    const columns = body
      .split('\n')
      .map(l => l.replace(/\r$/, '')) // убираем только \r
      .filter(l => l.length > 0)
    tables.push({ name, columns })
  }

  return { tables, errors: [] }
}