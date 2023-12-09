const _ = require('lodash');
const moment = require('moment');
const library  = require('./library');
const config  = require('../config');
const {User, Attempt, Answer, seq, sequelize} = require('../db-models')


class TruthOrDare {

  constructor(data) {
    Object.assign(this,data);
  }

  async serialize() {
    let self = this;
    await this.user.save();
    return Object.assign(_.omit(self,['user']),{});
  }

  static async deserialize(bag, event) {
    const data = _.cloneDeep(bag || {});
    const user = await  User.get(event.user.userId)
    data.user = user;
    let model = new TruthOrDare(data);
    return model;
  }

  async shouldOfferSub(event) {
    if(_.random() > 0.3) return false;
    const hoursSinceUserCreated = moment().diff(moment(this.user.createdAt), 'hours');
    if(hoursSinceUserCreated < 12) return false;

    if(this.user.lastSubOffer) {
      const minutesSinceLastSubOffer = moment().diff(moment(this.user.lastSubOffer), 'minutes');
      if(minutesSinceLastSubOffer< 5) return false;
    }
    const isEntitled = await this.isSubscribed(event, true)
    if(isEntitled) return false
    this.user.lastSubOffer = new Date();
    return true;
  }

  async shouldShowAds(event) {
    if(event.request.locale != 'en-US') return false;
    if(!event.rawEvent.context.Advertising) return false;
    const hoursSinceUserCreated = moment().diff(moment(this.user.createdAt), 'hours');
    if(hoursSinceUserCreated < 12) return false;

    const isEntitled = await this.isSubscribed(event, true);
     return !isEntitled
  }

  async isSubscribed(event, defaultOnNoProduct) {
    const product = await event.alexa.isp.getProductByReferenceName('full_library')
    if(!product) return defaultOnNoProduct; // Where there is no subscription, we'll give the chance to not have ads
    const isEntitled = _.get(product, 'entitled') == 'ENTITLED'
    return isEntitled
  }

  async pickTruth(event) {
    this.truth = library.pickTruth(await this.isSubscribed(event, false));
  }

  async pickDare(event) {
    this.dare = library.pickDare(await this.isSubscribed(event, false));
  }

}

module.exports = TruthOrDare;
