describe('hx-boost attribute', function() {
  beforeEach(function() {
    this.server = makeServer()
    clearWorkArea()
  })
  afterEach(function() {
    this.server.restore()
    clearWorkArea()
  })

  it('handles basic anchor properly', function() {
    this.server.respondWith('GET', '/test', 'Boosted')
    var div = make('<div hx-target="this" hx-boost="true"><a id="a1" href="/test">Foo</a></div>')
    var a = byId('a1')
    a.click()
    this.server.respond()
    div.innerHTML.should.equal('Boosted')
  })

  it('handles basic form post properly', function() {
    this.server.respondWith('POST', '/test', 'Boosted')
    var div = make('<div hx-target="this" hx-boost="true"><form id="f1" action="/test" method="post"><button id="b1">Submit</button></form></div>')
    var btn = byId('b1')
    btn.click()
    this.server.respond()
    div.innerHTML.should.equal('Boosted')
  })

  it('handles basic form post with button formaction properly', function() {
    this.server.respondWith('POST', '/test', 'Boosted')
    var div = make('<div hx-target="this" hx-boost="true"><form id="f1" method="post"><button id="b1" formaction="/test">Submit</button></form></div>')
    var btn = byId('b1')
    btn.click()
    this.server.respond()
    div.innerHTML.should.equal('Boosted')
  })

  it('handles basic form post with button formmethod properly', function() {
    this.server.respondWith('POST', '/test', 'Boosted')
    var div = make('<div hx-target="this" hx-boost="true"><form id="f1" action="/test"><button id="b1" formmethod="post">Submit</button></form></div>')
    var btn = byId('b1')
    btn.click()
    this.server.respond()
    div.innerHTML.should.equal('Boosted')
  })

  it('handles basic form post properly w/ explicit action', function() {
    this.server.respondWith('POST', '/test', 'Boosted')
    var div = make('<div hx-target="this"><form id="f1" action="/test" method="post"  hx-trigger="click" hx-boost="true"></form></div>')
    var form = byId('f1')
    form.click()
    this.server.respond()
    div.innerHTML.should.equal('Boosted')
  })

  it('handles basic form get properly', function() {
    this.server.respondWith('GET', '/test', 'Boosted')
    var div = make('<div hx-target="this" hx-boost="true"><form id="f1" action="/test" method="get"><button id="b1">Submit</button></form></div>')
    var btn = byId('b1')
    btn.click()
    this.server.respond()
    div.innerHTML.should.equal('Boosted')
  })

  it('handles basic form with no explicit method property', function() {
    this.server.respondWith('GET', '/test', 'Boosted')
    var div = make('<div hx-target="this" hx-boost="true"><form id="f1" action="/test"><button id="b1">Submit</button></form></div>')
    var btn = byId('b1')
    btn.click()
    this.server.respond()
    div.innerHTML.should.equal('Boosted')
  })

  it('does not boost forms with method="dialog"', function() {
    make('<div hx-boost="true"><form id="f1" action="/test" method="dialog"><button id="b1">close</button></form></div>')
    var form = byId('f1')

    var internalData = htmx._('getInternalData')(form)
    should.equal(undefined, internalData.boosted)
  })

  it('handles basic anchor properly w/ data-* prefix', function() {
    this.server.respondWith('GET', '/test', 'Boosted')
    var div = make('<div data-hx-target="this" data-hx-boost="true"><a id="a1" href="/test">Foo</a></div>')
    var a = byId('a1')
    a.click()
    this.server.respond()
    div.innerHTML.should.equal('Boosted')
  })

  it('overriding default swap style does not effect boosting', function() {
    htmx.config.defaultSwapStyle = 'afterend'
    try {
      this.server.respondWith('GET', '/test', 'Boosted')
      var a = make('<a hx-target="this" hx-boost="true" id="a1" href="/test">Foo</a>')
      a.click()
      this.server.respond()
      a.innerHTML.should.equal('Boosted')
    } finally {
      htmx.config.defaultSwapStyle = 'innerHTML'
    }
  })

  it('anchors w/ explicit targets are not boosted', function() {
    var a = make('<a hx-target="this" hx-boost="true" id="a1" href="/test" target="_blank">Foo</a>')
    var internalData = htmx._('getInternalData')(a)
    should.equal(undefined, internalData.boosted)
  })

  it('includes an HX-Boosted Header', function() {
    this.server.respondWith('GET', '/test', function(xhr) {
      should.equal(xhr.requestHeaders['HX-Boosted'], 'true')
      xhr.respond(200, {}, 'Boosted!')
    })

    var btn = make('<a hx-boost="true" hx-target="this" href="/test">Click Me!</a>')
    btn.click()
    this.server.respond()
    btn.innerHTML.should.equal('Boosted!')
  })

  it('form get w/ search params in action property excludes search params', function() {
    this.server.respondWith('GET', /\/test.*/, function(xhr) {
      should.equal(undefined, getParameters(xhr).foo)
      xhr.respond(200, {}, 'Boosted!')
    })

    var div = make('<div hx-target="this" hx-boost="true"><form id="f1" action="/test?foo=bar" method="get"><button id="b1">Submit</button></form></div>')
    var btn = byId('b1')
    btn.click()
    this.server.respond()
    div.innerHTML.should.equal('Boosted!')
  })

  it('form post w/ query params in action property uses full url', function() {
    this.server.respondWith('POST', /\/test.*/, function(xhr) {
      should.equal(undefined, getParameters(xhr).foo)
      xhr.respond(200, {}, 'Boosted!')
    })
    var div = make('<div hx-target="this" hx-boost="true"><form id="f1" action="/test?foo=bar" method="post"><button id="b1">Submit</button></form></div>')
    var btn = byId('b1')
    btn.click()
    this.server.respond()
    div.innerHTML.should.equal('Boosted!')
  })

  it('form get with an unset action properly submits', function() {
    this.server.respondWith('GET', /\/*/, function(xhr) {
      xhr.respond(200, {}, 'Boosted!')
    })

    var div = make('<div hx-target="this" hx-boost="true"><form id="f1" method="get"><button id="b1">Submit</button></form></div>')
    var btn = byId('b1')
    btn.click()
    this.server.respond()
    div.innerHTML.should.equal('Boosted!')
  })

  it('form get with no action properly clears existing parameters on submit', function() {
    /// add a foo=bar to the current url
    var path = location.href
    if (!path.includes('foo=bar')) {
      if (!path.includes('?')) {
        path += '?foo=bar'
      } else {
        path += '&foo=bar'
      }
    }
    history.replaceState({ htmx: true }, '', path)

    this.server.respondWith('GET', /\/*/, function(xhr) {
      // foo should not be present because the form is a get with no action
      should.equal(undefined, getParameters(xhr).foo)
      xhr.respond(200, {}, 'Boosted!')
    })

    var div = make('<div hx-target="this" hx-boost="true"><form id="f1" method="get"><button id="b1">Submit</button></form></div>')
    var btn = byId('b1')
    btn.click()
    this.server.respond()
    div.innerHTML.should.equal('Boosted!')
  })

  it('form get with an empty action properly clears existing parameters on submit', function() {
    /// add a foo=bar to the current url
    var path = location.href
    if (!path.includes('foo=bar')) {
      if (!path.includes('?')) {
        path += '?foo=bar'
      } else {
        path += '&foo=bar'
      }
    }
    history.replaceState({ htmx: true }, '', path)

    this.server.respondWith('GET', /\/*/, function(xhr) {
      // foo should not be present because the form is a get with no action
      should.equal(undefined, getParameters(xhr).foo)
      xhr.respond(200, {}, 'Boosted!')
    })

    var div = make('<div hx-target="this" hx-boost="true"><form id="f1" action="" method="get"><button id="b1">Submit</button></form></div>')
    var btn = byId('b1')
    btn.click()
    this.server.respond()
    div.innerHTML.should.equal('Boosted!')
  })

  it('the default boost swap only applies when boosting', function() {
    var originalSwap = htmx.config.defaultBoostSwap
    try {
      htmx.config.defaultBoostSwap = 'textContent'
      this.server.respondWith('GET', '/test', '&amp;')

      var a = make('<a href="/test" hx-target="this" hx-boost="true">Foo</a>')
      a.click()
      this.server.respond()
      a.textContent.should.equal('&amp;')

      var a = make('<a hx-get="/test">Foo</a>')
      a.click()
      this.server.respond()
      a.textContent.should.equal('&')
    } finally {
      htmx.config.defaultBoostSwap = originalSwap
    }
  })

  it('the default boost select only applies when boosting', function() {
    var originalSelect = htmx.config.defaultBoostSelect
    try {
      htmx.config.defaultBoostSelect = '#inner'
      this.server.respondWith('GET', '/test', '<div><span id="inner">Result</span></div>')

      var a = make('<a href="/test" hx-target="this" hx-boost="true">Foo</a>')
      a.click()
      this.server.respond()
      a.innerHTML.should.equal('<span id="inner">Result</span>')

      var a = make('<a hx-get="/test">Foo</a>')
      a.click()
      this.server.respond()
      a.innerHTML.should.equal('<div><span id="inner">Result</span></div>')
    } finally {
      htmx.config.defaultBoostSelect = originalSelect
    }
  })

  it('the default boost target only applies when boosting', function() {
    var originalTarget = htmx.config.defaultBoostTarget
    this.server.respondWith('GET', '/test', 'Result')
    try {
      htmx.config.defaultBoostTarget = '#d1'
      var div = make('<div id="d1"><a id="a1" href="/test" hx-boost="true">Foo</a></div>')
      var a = byId('a1')
      a.click()
      this.server.respond()
      div.innerHTML.should.equal('Result')

      htmx.config.defaultBoostTarget = '#d2'
      var div = make('<div id="d2"><a id="a2" hx-get="/test">Foo</a></div>')
      var a = byId('a2')
      a.click()
      this.server.respond()
      a.innerHTML.should.equal('Result')
    } finally {
      htmx.config.defaultBoostTarget = originalTarget
    }
  })

  it('the default boost swap should be overridden when hx-swap is used', function() {
    var originalSwap = htmx.config.defaultBoostSwap
    try {
      htmx.config.defaultBoostSwap = 'textContent settle:432ms'
      this.server.respondWith('GET', '/test', '<div>Result</div>')
      var swapSpec = htmx._('getSwapSpecification') // internal function for swap spec

      var div = make('<div><a id="a1" href="/test" hx-target="this" hx-boost="true" hx-swap="afterend">Foo</a></div>')
      var a = byId('a1')
      swapSpec(a).settleDelay.should.equal(htmx.config.defaultSettleDelay)

      a.click()
      this.server.respond()
      div.children.length.should.equal(2)
    } finally {
      htmx.config.defaultBoostSwap = originalSwap
    }
  })

  it('the default boost select should be overridden when hx-select is used', function() {
    var originalSelect = htmx.config.defaultBoostSelect
    try {
      htmx.config.defaultBoostSelect = '#r1'
      this.server.respondWith('GET', '/test', '<span id="r1"></span> <span id="r2"></span>')

      var a = make('<a href="/test" hx-target="this" hx-boost="true" hx-select="#r2">Foo</a>')
      a.click()
      this.server.respond()
      a.firstElementChild.id.should.equal('r2')
    } finally {
      htmx.config.defaultBoostSelect = originalSelect
    }
  })

  it('the default boost target should be overridden when hx-target is used', function() {
    var originalTarget = htmx.config.defaultBoostTarget
    try {
      htmx.config.defaultBoostTarget = '#d1'
      this.server.respondWith('GET', '/test', 'Result')

      var div = make('<div>' +
                      '  <div id="d1"></div>' +
                      '  <div id="d2"></div>' +
                      '  <a id="a1" href="/test" hx-target="#d2" hx-boost="true"></a>' +
                      '</div>')
      var a = byId('a1')
      a.click()
      this.server.respond()
      div.querySelector(':not(:empty)').id.should.equal('d2')
    } finally {
      htmx.config.defaultBoostTarget = originalTarget
    }
  })

  it('the default boost target should accept "this" as a value', function() {
    var originalTarget = htmx.config.defaultBoostTarget
    try {
      htmx.config.defaultBoostTarget = 'this'
      this.server.respondWith('GET', '/test', 'Result')

      var a = make('<a id="a1" href="/test" hx-boost="true">Foo</a>')
      a.click()
      this.server.respond()
      a.innerHTML.should.equal('Result')
    } finally {
      htmx.config.defaultBoostTarget = originalTarget
    }
  })

  it('the default boost swap should only override boost scolling when the modifier is specified', function() {
    var originalSwap = htmx.config.defaultBoostSwap
    var originalScroll = htmx.config.scrollIntoViewOnBoost
    try {
      var swapSpec = htmx._('getSwapSpecification') // internal function for swap spec
      var a = make('<a href="/test" hx-target="this" hx-boost="true">Foo</a>')

      htmx.config.defaultBoostSwap = 'innerHTML show:bottom'
      htmx.config.scrollIntoViewOnBoost = true
      swapSpec(a).show.should.equal('bottom')

      htmx.config.defaultBoostSwap = 'innerHTML'
      htmx.config.scrollIntoViewOnBoost = true
      swapSpec(a).show.should.equal('top')

      htmx.config.defaultBoostSwap = 'innerHTML'
      htmx.config.scrollIntoViewOnBoost = false
      should.equal(swapSpec(a).show, undefined)
    } finally {
      htmx.config.defaultBoostSwap = originalSwap
      htmx.config.scrollIntoViewOnBoost = originalScroll
    }
  })

  it('a default boost swap should use innerHTML swap style when missing', function() {
    var originalSwap = htmx.config.defaultBoostSwap
    var originalStyle = htmx.config.defaultSwapStyle
    htmx.config.defaultSwapStyle = 'textContent' // show it's irrelevant
    try {
      var swapSpec = htmx._('getSwapSpecification') // internal function for swap spec
      var a = make('<a href="/test" hx-target="this" hx-boost="true">Foo</a>')

      htmx.config.defaultBoostSwap = 'outerHTML settle:234ms'
      swapSpec(a).swapStyle.should.equal('outerHTML')
      swapSpec(a).settleDelay.should.equal(234)

      htmx.config.defaultBoostSwap = 'settle:345ms'
      swapSpec(a).swapStyle.should.equal('innerHTML')
      swapSpec(a).settleDelay.should.equal(345)
    } finally {
      htmx.config.defaultBoostSwap = originalSwap
      htmx.config.defaultSwapStyle = originalStyle
    }
  })
})
