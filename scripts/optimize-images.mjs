import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = path.resolve(process.cwd())
const srcDir = path.join(root, 'public', 'images')

const inputs = ['img01.png']

const ensureExists = async (filePath) => {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

const processImage = async (inputName) => {
  const inputPath = path.join(srcDir, inputName)
  const baseName = inputName.replace(/\.[^.]+$/, '')

  if (!(await ensureExists(inputPath))) {
    console.warn(`Arquivo não encontrado: ${inputPath}`)
    return
  }

  const image = sharp(inputPath)
  const metadata = await image.metadata()
  console.log(`Processando ${inputName} (${metadata.format} ${metadata.width}x${metadata.height})`)

  const avifPath = path.join(srcDir, `${baseName}.avif`)
  const webpPath = path.join(srcDir, `${baseName}.webp`)

  await image
    .avif({ quality: 55, effort: 5 })
    .toFile(avifPath)
  console.log(`Gerado: ${path.basename(avifPath)}`)

  await image
    .webp({ quality: 70 })
    .toFile(webpPath)
  console.log(`Gerado: ${path.basename(webpPath)}`)
}

for (const name of inputs) {
  await processImage(name)
}

console.log('Otimização de imagens concluída.')