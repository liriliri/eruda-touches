module.exports = function(eruda) {
  const { evalCss, each, contain, toArr } = eruda.util

  class Touches extends eruda.Tool {
    constructor() {
      super()
      this.name = 'touches'
      this._style = evalCss(require('./style.scss'))
      this._touches = []
      this._isRunning = false
      this._updateTouches = e => {
        const touches = []
        const changedTouches = toArr(e.changedTouches)
        each(e.touches, touch => {
          touches.push({
            clientX: touch.clientX,
            clientY: touch.clientY,
            changed: contain(changedTouches, touch)
          })
        })
        this._touches = touches
      }
    }
    init($el, container) {
      super.init($el, container)
      $el.html(require('./template.hbs')())
      this._initCanvas()
      this._bindEvent()
    }
    show() {
      super.show()
      this._start()
    }
    hide() {
      super.hide()
      this._stop()
    }
    destroy() {
      super.destroy()
      evalCss.remove(this._style)
      window.removeEventListener('touchstart', this._updateTouches)
      window.removeEventListener('touchmove', this._updateTouches)
      window.removeEventListener('touchend', this._updateTouches)
      window.removeEventListener('touchcancel', this._updateTouches)
    }
    _initCanvas() {
      const canvas = (this._canvas = this._$el.find('canvas').get(0))
      const ctx = (this._ctx = this._canvas.getContext('2d'))
      const winWidth = window.innerWidth
      const winHeight = window.innerHeight
      canvas.width = 800
      canvas.height = 800 * (winHeight / winWidth)
      ctx.textBaseline = 'middle'
    }
    _start() {
      if (this._isRunning) return
      this._isRunning = true
      const self = this
      function loop() {
        if (!self._isRunning) return
        self._update()
        requestAnimationFrame(loop)
      }
      loop()
    }
    _stop() {
      this._isRunning = false
    }
    _update() {
      const ctx = this._ctx
      const touches = this._touches
      const canvas = this._canvas
      const { width, height } = canvas
      const { innerWidth, innerHeight } = window
      ctx.clearRect(0, 0, width, height)

      const curTheme = evalCss.getCurTheme()

      if (touches.length === 0) {
        ctx.fillStyle = curTheme.foreground
        ctx.font = 'bold 50px Helvetica,Arial,sans-serif'
        ctx.fillText('Touch the Screen', width / 2 - 200, height / 2)
        return
      }

      ctx.font = 'bold 50px Helvetica,Arial,sans-serif'

      each(touches, touch => {
        const { clientX, clientY, changed } = touch
        const x = (clientX / innerWidth) * width
        const y = (clientY / innerHeight) * height
        if (changed) {
          ctx.fillStyle = curTheme.consoleErrorForeground
        } else {
          ctx.fillStyle = curTheme.accent
        }
        ctx.fillText(
          `${Math.round(clientX)}, ${Math.round(clientY)}`,
          x + 50,
          y
        )
        ctx.beginPath()
        ctx.arc(x, y, 25, 0, Math.PI * 2, true)
        ctx.closePath()
        ctx.fill()
      })
    }
    _bindEvent() {
      window.addEventListener('touchstart', this._updateTouches, true)
      window.addEventListener('touchmove', this._updateTouches, true)
      window.addEventListener('touchend', this._updateTouches, true)
      window.addEventListener('touchcancel', this._updateTouches, true)
    }
  }

  return new Touches()
}
