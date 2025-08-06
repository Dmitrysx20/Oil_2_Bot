const SmartRouterModule = require('../../modules/smart-router');

class SmartRouter {
  constructor() {
    this.router = new SmartRouterModule();
  }

  analyzeRequest(input) {
    return this.router.analyzeRequest(input);
  }
}

module.exports = SmartRouter; 