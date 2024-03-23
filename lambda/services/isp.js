const _ = require('lodash');
const rp = require("request-promise");

function isLocalizedRequest(request) {
  return (
    request.type && (
      request.type.includes("AudioPlayer.") ||
      request.type.includes("PlaybackController.") ||
      request.type.includes("Connections.") ||
      request.type.includes("GameEngine.") ||
      request.type.includes("System.") ||
      request.type === "Display.ElementSelected" ||
      request.type === "SessionEndedRequest" ||
      request.type === "IntentRequest" ||
      request.type === "LaunchRequest"
    )
  );
}

exports.InSkillPurchase = class InSkillPurchase {
  static buy(productId, token) {
    const payload = this.formatPayload(productId);
    return {
        name: "Buy",
        payload,
        token: token || "token",
        type: "Connections.SendRequest"
    }
  }

  static cancel( productId, token) {
    return this.sendConnectionSendRequest("Cancel", productId, token);
  }

  static upsell(
    productId,
    upsellMessage,
    token,
  ) {
    return this.sendConnectionSendRequest(
      "Upsell",
      productId,
      token,
      upsellMessage,
    );
  }

  static sendConnectionSendRequest(
    method,
    productId,
    token,
    upsellMessage,
  ) {
    const payload = this.formatPayload(productId, upsellMessage);
    const ret = {
        name: method,
        payload,
        token: token || "token",
        type: "Connections.SendRequest"
    }
    //console.log('sendConnectionSendRequest', ret)
    return ret;
  }

  static formatPayload( productId, upsellMessage)
  {
    return {
      InSkillProduct: {
        productId,
      },
      upsellMessage,
    };
  }

  constructor(event, log) {
    this.rawEvent = _.cloneDeep(event);
  }

  isAllowed() {
    const ALLOWED_ISP_ENDPOINTS = {
      "en-US": "https://api.amazonalexa.com",
    };

    const locale = this.rawEvent.request.locale;
    const endpoint = _.get(this.rawEvent, "context.System.apiEndpoint");

    return _.get(ALLOWED_ISP_ENDPOINTS, locale) === endpoint;
  }

  async buyByReferenceName(referenceName, token) {
    const product = await this.getProductByReferenceName(referenceName);
    return InSkillPurchase.buy(_.get(product, "productId"), token);
  }

  async cancelByReferenceName( referenceName, token) {
    const product = await this.getProductByReferenceName(referenceName);
    return InSkillPurchase.cancel(_.get(product, "productId"), token);
  }

  async upsellByReferenceName(
    referenceName,
    upsellMessage,
    token,
  ) {
    const product = await this.getProductByReferenceName(referenceName);
    //console.log("upsellByReferenceName", product)
    return InSkillPurchase.upsell(
      _.get(product, "productId"),
      upsellMessage,
      token,
    );
  }

  async getProductByReferenceName(referenceName) {
    const result = await this.getProductList();
    return _.find(result.inSkillProducts, { referenceName }) || {};
  }

  getProductList() {
    const { apiEndpoint, apiAccessToken } = this.rawEvent.context.System;

    //console.log('endpoint', apiEndpoint)
    //console.log('raw', this.rawEvent)

    const options = {
      headers: {
        "Accept-Language": isLocalizedRequest(this.rawEvent.request) ? this.rawEvent.request.locale : "en-us",
        "Authorization": `Bearer ${apiAccessToken}`,
        "Content-Type": "application/json",
      },
      json: true,
      method: "GET",
      uri: `${apiEndpoint}/v1/users/~current/skills/~current/inSkillProducts`,
    };

    return rp(options);
  }
}
