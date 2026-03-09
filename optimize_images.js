const sharp = require("sharp")
const fs = require("fs")
const path = require("path")

const inputDir = path.join(__dirname, "src", "assets")
const outputDir = path.join(__dirname, "src", "assets") // Overwrite original for now

fs.readdir(inputDir, (err, files) => {
  if (err) {
    console.error("Error reading input directory:", err)
    return
  }

  files.forEach(file => {
    if (file.endsWith(".png")) {
      const inputPath = path.join(inputDir, file)
      const outputFileName = file.replace(".png", ".webp")
      const outputPath = path.join(outputDir, outputFileName)

      sharp(inputPath)
        .webp({ quality: 80 })
        .toFile(outputPath, (err, info) => {
          if (err) {
            console.error(`Error processing ${file}:`, err)
          } else {
            console.log(`Processed ${file} to ${outputFileName}:`, info)
            // Optionally remove the original PNG file after successful conversion
            // fs.unlink(inputPath, (unlinkErr) => {
            //   if (unlinkErr) console.error(`Error deleting original ${file}:`, unlinkErr)
            //   else console.log(`Deleted original ${file}`)
            // })
          }
        })
    }
  })
})


