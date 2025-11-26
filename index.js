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
  // clearing old text
  imageContainer.querySelectorAll('p').forEach(el=>el.remove())
  resultContainer.innerText = ''
  
  fetch(endPoint,{
    method: 'POST',
    headers: {
      "apikey": "3515c3cdf888957"
    },
    body: formData
  }).then(response=>response.json())
  .then(data=>{

    const scale = imagePreview.height/ogHeight
    // console.log("Original Dimensions:", ogHeight, ogWidth)
    // console.log("Current Dimensions:", imagePreview.height, imagePreview.width)
    // console.log("Scale", scale)
    resultContainer.innerHTML = data.ParsedResults[0].ParsedText
    data.ParsedResults[0].TextOverlay.Lines.forEach(line=>{
      const firstWord = line.Words[0]
      const lastWord = line.Words.slice(-1)[0]
      // finding line width
      const lastWordRight = lastWord.Left + lastWord.Width
      const width = lastWordRight - firstWord.Left

      const lineEl = document.createElement('p')
      lineEl.innerText = line.LineText
      lineEl.setAttribute('style', `top: ${(firstWord.Top/imagePreview.height) * scale * 100}%; left: ${(firstWord.Left/imagePreview.width) * scale * 100}%; height: ${(firstWord.Height/imagePreview.height) * scale * 100}%; width: ${(width/imagePreview.width) * scale * 100}%; font-size: ${firstWord.Height * scale * .7}px`)
      imageContainer.appendChild(lineEl)
    })

    window.onresize = () => {
      const scale = imagePreview.height/ogHeight
      console.log(scale)
      const textEls = imageContainer.querySelectorAll('p')
      textEls.forEach(el=>{
        el.style.fontSize = `${el.offsetHeight * .7}px`
      })
    }
  })
})