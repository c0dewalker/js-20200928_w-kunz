export default class DoubleSlider {
  element = null
  subElements = {}

  constructor({
                min = 0,
                max = 200,
                selected = {from: min, to: max},
                formatValue = value => '$' + value
              } = {}) {
    this.min = min
    this.max = max
    this.selected = selected
    this.formatValue = formatValue
    this.render()
  }

  render() {
    const wrapperElement = document.createElement('div')
    wrapperElement.innerHTML = `
      <div class="range-slider">
        <span data-element="from">${this.formatValue(this.selected.from)}</span>
        <div data-element="slider" class="range-slider__inner">
          <span data-element="leftThumb" class="range-slider__thumb-left"></span>
          <span data-element="rightThumb" class="range-slider__thumb-right"></span>
        </div>
        <span data-element="to">${this.formatValue(this.selected.to)}</span>
      </span>
    `
    this.element = wrapperElement.firstElementChild
    this.subElements = this.getSubElements(this.element)
    console.log(this.subElements)
    this.initEventListener()
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]')
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement
      return accum
    }, {})
  }

  initEventListener() {
    const {leftThumb, rightThumb} = this.subElements

    leftThumb.addEventListener('mousedown', (e) => {
      const sliderRect = this.subElements.slider.getBoundingClientRect()
      const leftBorder = sliderRect.left
      const sliderWidth = this.subElements.slider.offsetWidth
      const offset = e.clientX - leftThumb.getBoundingClientRect().left

      const onMouseMove = (e) => {
        let newLeft = (e.clientX - leftBorder - offset)
        const rightThumbPosition = rightThumb.getBoundingClientRect().left - leftBorder
        if (newLeft < 0) {
          newLeft = 0
        } else if (newLeft > rightThumbPosition) {
          newLeft = rightThumbPosition
        }
        leftThumb.style.left = newLeft + 'px'
        this.selected.from = Math.floor(this.min + newLeft / sliderWidth * (this.max - this.min))
        this.subElements.from.textContent = this.formatValue(this.selected.from)
      }

      const onMouseUp = () => {
        this.dispatchSelectionEvent()
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
      }
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    })

    addEventListener('mousedown', (e) => {
      const sliderRect = this.subElements.slider.getBoundingClientRect()
      const leftBorder = sliderRect.left
      const sliderWidth = this.subElements.slider.offsetWidth
      const offset = e.clientX - rightThumb.getBoundingClientRect().left

      const onMouseMove = (e) => {
        let newRight = (e.clientX - leftBorder - offset)
        const leftThumbPosition = leftThumb.getBoundingClientRect().left - leftBorder
        if (newRight < leftThumbPosition) {
          newRight = leftThumbPosition
        } else if (newRight > sliderWidth) {
          newRight = sliderWidth
        }
        rightThumb.style.left = newRight + 'px'
        this.selected.to = Math.floor(this.min + newRight / sliderWidth * (this.max - this.min))
        this.subElements.to.textContent = this.formatValue(this.selected.to)
      }

      const onMouseUp = () => {
        this.dispatchSelectionEvent()
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
      }
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    })
  }

  dispatchSelectionEvent = () => {
    const rangeSelectionEvent = new CustomEvent('range-select', {
      bubbles: true,
      detail: {
        from: this.selected.from,
        to: this.selected.to
      }
    })
    this.element.dispatchEvent(rangeSelectionEvent)
  }

  remove() {
    this.element.remove()
  }

  destroy() {
    this.element = null
    this.subElements = {}
  }
}
