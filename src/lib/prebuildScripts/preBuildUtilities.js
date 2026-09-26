import dotenv from 'dotenv'
import fs from 'node:fs'
import axios from 'axios'

export const preBuildDevelopment = async () => {
  dotenv.config()

  const envVars = {}

  for (const key in process.env) {
    envVars[key] = process.env[key]
  }

  const generateStaticJson = (filename, newData) => {
    const staticPath = 'src/lib/preBuildScripts/static/'
    const filePath = `${staticPath}${filename}`

    // Create the directory if it doesn't exist
    fs.mkdirSync(staticPath, { recursive: true })

    // Attempt to read the existing data
    let existingData

    try {
      existingData = fs.readFileSync(filePath, 'utf8')
    } catch (error) {
      console.log('Error', error)
      existingData = null
    }

    const newJson = JSON.stringify(newData)

    // Only write when the data has changed
    if (existingData !== newJson) {
      console.log(`Generated new json file for \x1b[32m${filename}\x1b[0m`)

      fs.writeFileSync(filePath, newJson)
    } else {
      console.log(`Skipping file write in \x1b[33m${filename}\x1b[0m.`)
    }
  }

  const apiHealth = await axios.get(`${envVars.VITE_API_URL}/health`)

  const apiTopAnimes = await axios.get(
    `${envVars.VITE_API_URL}/animes?limit=10&includes=genres,type`,
  )

  generateStaticJson('health.json', apiHealth.data || [])
  generateStaticJson('top-animes.json', apiTopAnimes.data.data || [])
}
