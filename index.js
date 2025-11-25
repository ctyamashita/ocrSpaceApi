function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}



const endPoint = "https://api.ocr.space/parse/image"
const docInput = document.getElementById("doc")
const resultContainer = document.getElementById('result')
const imagePreview = document.querySelector('.img-preview')
let ogHeight, ogWidth
const ogImage = new Image()
ogImage.onload = function() {
  ogHeight = ogImage.height
  ogWidth = ogImage.width
}

const imageContainer = document.querySelector('.img-container')

docInput.addEventListener("input", async (e) => {
  const image = e.target.files[0]
  const imageExtension = image.type.split('/')[1]
  console.log(image)

  const formData = new FormData()
  const base64 = await toBase64(image)
  formData.append('base64Image', base64)
  formData.append('language', 'jpn')
  formData.append('OCREngine', 2)
  formData.append('isOverlayRequired', true)
  // formData.append('filetype', imageExtension)
  // formData.append('isOverlayRequired', true)
  imagePreview.src = base64
  ogImage.src = base64
  
  fetch(endPoint,{
    method: 'POST',
    headers: {
      "apikey": "3515c3cdf888957"
    },
    body: formData
  }).then(response=>response.json())
  .then(data=>{
    const ratio = imagePreview.height/ogHeight
    console.log("Original Dimensions:", ogHeight, ogWidth)
    console.log("Current Dimensions:", imagePreview.height, imagePreview.width)
    console.log("Ratio", ratio)
    resultContainer.innerHTML = data.ParsedResults[0].ParsedText
    data.ParsedResults[0].TextOverlay.Lines.forEach(line=>{
      // per line
      const lineEl = document.createElement('p')
      lineEl.innerText = line.LineText
      lineEl.setAttribute('style', `position: absolute; top: ${line.Words[0].Top * ratio}px; left: ${line.Words[0].Left * ratio}px; height: ${line.Words[0].Height * ratio}px; width: ${((line.Words[line.Words.length - 1].Left + line.Words[line.Words.length - 1].Width) - line.Words[0].Left) * ratio}px; font-size: ${line.Words[0].Height * ratio * .7}px`)
      imageContainer.appendChild(lineEl)

      // per word
      // line.Words.forEach(word=>{
      //   const wordEl = document.createElement('p')
      //   wordEl.innerText = word.WordText
      //   wordEl.setAttribute('style', `position: absolute; top: ${word.Top * ratio}px; left: ${word.Left * ratio}px; height: ${word.Height * ratio}px; width: ${word.Width * ratio}px; font-size: ${word.Height * ratio * .7}px`)
      //   imageContainer.appendChild(wordEl)
      // })
    })
  })
})