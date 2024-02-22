const _ = require('lodash');
const moment = require('moment');
const library  = require('./library');
const config  = require('../config');
const {User, Attempt, Answer, seq, sequelize} = require('../db-models')
const {InSkillPurchase} = require("./isp");


class TruthOrDare {

  constructor(data, isp) {
    Object.assign(this,data);
    this.isp = isp
  }

  async serialize() {
    let self = this;
    await this.user.save();
    return Object.assign(_.omit(self,['user','isp']),{});
  }

  static async deserialize(bag, event) {
    const data = _.cloneDeep(bag || {});
    const userId = event?.session?.user?.userId
    if(userId) {
      const user = await  User.get(userId)
      data.user = user;
    }
    const isp = new InSkillPurchase(event);
    let model = new TruthOrDare(data, isp);
    return model;
  }

  async shouldOfferSub() {
     if(_.random() > 0.3) return false;
     const hoursSinceUserCreated = moment().diff(moment(this.user.createdAt), 'hours');
     if(hoursSinceUserCreated < 12) return false;

     if(this.user.lastSubOffer) {
       const minutesSinceLastSubOffer = moment().diff(moment(this.user.lastSubOffer), 'minutes');
       if(minutesSinceLastSubOffer< 5) return false;
     }
    const isEntitled = await this.isSubscribed(true)
    console.log("isEntitled?", isEntitled)
    if(isEntitled) return false
    this.user.lastSubOffer = new Date();
    return true;
  }

  async isSubscribed(defaultOnNoProduct) {
    const product = await this.isp.getProductByReferenceName('full_library')
    if(!product) return defaultOnNoProduct; // Where there is no subscription, we'll give the chance to not have ads
    const isEntitled = _.get(product, 'entitled') == 'ENTITLED'
    return isEntitled
  }

  async pickTruth() {
    this.truth = library.pickTruth(await this.isSubscribed(false));
  }

  async pickDare() {
    this.dare = library.pickDare(await this.isSubscribed(false));
  }

}

module.exports = TruthOrDare;
