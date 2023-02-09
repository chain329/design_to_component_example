import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ['bars']

  static values = {
    width: { type: Number, default: 26 },
    height: { type: Number, default: 10 },
  }

  async connect() {
    this.mediaStream = await this.checkMedia({ audio: true })
    this.barsArray = this.build2DArray(this.widthValue, this.heightValue)
    this.connectMicrophone()
  }

  disconnect() {
    this.closeMedia()
  }

  async checkMedia(constraints = {}) {
    try {
      return await navigator.mediaDevices.getUserMedia({ ...constraints })
    } catch (e) {
      console.error(e)
    }
  }

  closeMedia() {
    if (!this.mediaStream) { return }

    this.mediaStream.getTracks().forEach((track) => {
      track.stop()
    })
  }

  // [
  //   [0, 0, ...],
  //   [0, 0, ...],
  //   ...
  // ]
  build2DArray(w, h) {
    return Array.from(Array(w), () => new Array(h).fill(0))
  }

  // ref: https://stackoverflow.com/a/52952907
  // [Deprecation] The ScriptProcessorNode is deprecated. Use AudioWorkletNode instead. (https://bit.ly/audio-worklet)
  connectMicrophone() {
    this.audioContext = new AudioContext()
    this.analyser = this.audioContext.createAnalyser()
    console.log(this.audioContext)
    console.log(this.analyser)
    const microphone = this.audioContext.createMediaStreamSource(this.mediaStream)
    this.scriptProcessor = this.audioContext.createScriptProcessor(2048, 1, 1)

    this.analyser.smoothingTimeConstant = 0.8;
    this.analyser.fftSize = 1024;

    microphone.connect(this.analyser);
    this.analyser.connect(this.scriptProcessor);
    this.scriptProcessor.connect(this.audioContext.destination);
    this.scriptProcessor.onaudioprocess = this.onAudioProcess.bind(this)
  }

  onAudioProcess() {
    const array = new Uint8Array(this.analyser.frequencyBinCount)
    this.analyser.getByteFrequencyData(array)
    const arraySum = array.reduce((a, value) => a + value, 0)
    const average = arraySum / array.length

    this.addToBars(Math.round(average / 5))
  }

  addToBars (value) {
    value = value >= this.heightValue ? this.heightValue : value
    const bars = [...this.barsArray].reverse()
    bars.shift()
    bars.push(new Array(this.heightValue).fill(0).fill(1, this.heightValue - value))
    this.barsArray = bars.reverse()
    this.changeRenderBars()
  }

  changeRenderBars() {
    let html = ''
    // console.log(this.barsArray)
    this.barsArray.forEach((barArray) => {
      html += '<div class="inline-flex flex-col gap-y-0.5">'
      barArray.forEach((bar) => {
        html += `<div class="w-1 h-1 ${bar ? 'bg-[#09BB09]' : 'bg-[#F3F8FF]'}"></div>`
      })
      html += '</div>'
    })
    this.barsTarget.innerHTML = html
  }
}
