import provide from '../provide'
import { assign } from '../utilities'
import { NULL_DIMENSION } from '../constants'

class Ecommerce {
  constructor (tracker) {
    /* Product Actions 
      - detail : A view of product detail
      - addToCart : Add a product to shopping cart
      - removeFromCart : Remove a product from shopping cart
      - checkout : Initiating the checkout process for a product
      - purchase : The sale of a product
    */
    this.actionType = NULL_DIMENSION
    this.actionPayload = {}
    this.products = []

    tracker.events.on('ec:addProduct', (args) => {
      const product = assign({}, args[0])
      this.products.push({
        category: product.category || NULL_DIMENSION,
        name: product.name || NULL_DIMENSION,
        original_price: product.original_price || 0,
        cost_price: product.cost_price || 0,
        quantity: product.quantity || 1,
        product_id: product.product_id || null,
        parent_id: product.parent_id || null
      })
    })
    tracker.events.on('ec:setAction', (args) => {
      this.actionType = args[0] || NULL_DIMENSION
      this.actionPayload = assign({}, { action_type: this.actionType }, args[1])
    })
    tracker.events.on('send', (args) => {
      if (this.actionType === NULL_DIMENSION) {
        return
      }
      const hitType = 'ecommerce'
      const options = tracker._getDefaultOptions(hitType, this.actionPayload)
      options['products'] = assign([], this.products)
      setTimeout(() => {
        tracker._post(options)
        this.reset()
      }, 0)
    })
  }

  reset () {
    this.actionType = NULL_DIMENSION
    this.actionPayload = {}
    this.products = []
  }
}

provide('ecommerce', Ecommerce)
