export async function fetchData(url, options = {}) {
  const response = await fetch(url, options)
  if (!response.ok) {
    const error = new Error(`Fetch failed: ${response.status}`)
    error.name = response.status === 404 ? 'NotFound' : 'NetworkError'
    error.status = response.status
    throw error
  }
  return response.json()
}

export async function postData(url, data) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!response.ok) {
    const error = new Error(`Post failed: ${response.status}`)
    error.name = 'NetworkError'
    error.status = response.status
    throw error
  }
  return response.json()
}