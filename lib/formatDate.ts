
export function formatDate(input: string | Date) {
  const d = new Date(input)
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
