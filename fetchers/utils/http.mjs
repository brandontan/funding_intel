const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export async function fetchWithRetry(url, options = {}, retries = 3, backoffMs = 500) {
  let attempt = 0
  let lastError
  while (attempt <= retries) {
    try {
      const res = await fetch(url, options)
      if (!res.ok && attempt < retries) {
        lastError = new Error(`Request failed ${res.status} ${res.statusText}`)
        await sleep(backoffMs * (attempt + 1))
        attempt += 1
        continue
      }
      return res
    } catch (error) {
      lastError = error
      if (attempt === retries) break
      await sleep(backoffMs * (attempt + 1))
      attempt += 1
    }
  }
  throw lastError ?? new Error('Request failed')
}
