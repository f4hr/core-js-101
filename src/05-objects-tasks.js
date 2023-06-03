/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */


/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  this.width = width;
  this.height = height;
}
Rectangle.prototype.getArea = function getArea() {
  return this.width * this.height;
};


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const obj = JSON.parse(json);
  Object.setPrototypeOf(obj, proto);
  return obj;
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

class BaseSelector {
  constructor(value, type) {
    this.selectors = {
      element: [],
      id: [],
      class: [],
      attr: [],
      pseudoClass: [],
      pseudoElement: [],
    };
    this.errors = {
      elementCount: 'Element, id and pseudo-element should not occur more then one time inside the selector',
      elementOrder: 'Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element',
    };
    this[type](value);
  }

  countSelectorsByType(type) {
    const validOrder = {
      element: ['id', 'class', 'attr', 'pseudoClass', 'pseudoElement'],
      id: ['class', 'attr', 'pseudoClass', 'pseudoElement'],
      class: ['attr', 'pseudoClass', 'pseudoElement'],
      attr: ['pseudoClass', 'pseudoElement'],
      pseudoClass: ['pseudoElement'],
      pseudoElement: [],
    };
    return Object.entries(this.selectors).reduce((acc, [key, values]) => (
      acc + (validOrder[type].includes(key) ? values.length : 0)
    ), 0);
  }

  element(value) {
    if (this.selectors.element.length > 0) {
      throw new Error(this.errors.elementCount);
    }
    if (this.countSelectorsByType('element') > 0) {
      throw new Error(this.errors.elementOrder);
    }
    this.selectors.element.push(String(value));
    return this;
  }

  id(value) {
    if (this.selectors.id.length > 0) {
      throw new Error(this.errors.elementCount);
    }
    if (this.countSelectorsByType('id') > 0) {
      throw new Error(this.errors.elementOrder);
    }
    this.selectors.id.push(`#${value}`);
    return this;
  }

  class(value) {
    if (this.countSelectorsByType('class') > 0) {
      throw new Error(this.errors.elementOrder);
    }
    this.selectors.class.push(`.${value}`);
    return this;
  }

  attr(value) {
    if (this.countSelectorsByType('attr') > 0) {
      throw new Error(this.errors.elementOrder);
    }
    this.selectors.attr.push(`[${value}]`);
    return this;
  }

  pseudoClass(value) {
    if (this.countSelectorsByType('pseudoClass') > 0) {
      throw new Error(this.errors.elementOrder);
    }
    this.selectors.pseudoClass.push(`:${value}`);
    return this;
  }

  pseudoElement(value) {
    if (this.selectors.pseudoElement.length > 0) {
      throw new Error(this.errors.elementCount);
    }
    if (this.countSelectorsByType('pseudoElement') > 0) {
      throw new Error(this.errors.elementOrder);
    }
    this.selectors.pseudoElement.push(`::${value}`);
    return this;
  }

  stringify() {
    return [
      'element',
      'id',
      'class',
      'attr',
      'pseudoClass',
      'pseudoElement',
    ].flatMap((type) => this.selectors[type]).join('');
  }
}

const cssSelectorBuilder = {
  element(value) {
    return new BaseSelector(value, 'element');
  },

  id(value) {
    return new BaseSelector(value, 'id');
  },

  class(value) {
    return new BaseSelector(value, 'class');
  },

  attr(value) {
    return new BaseSelector(value, 'attr');
  },

  pseudoClass(value) {
    return new BaseSelector(value, 'pseudoClass');
  },

  pseudoElement(value) {
    return new BaseSelector(value, 'pseudoElement');
  },

  combine(selector1, combinator, selector2) {
    const value = `${selector1.stringify()} ${combinator} ${selector2.stringify()}`;
    return new BaseSelector(value, 'element');
  },
};


module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
