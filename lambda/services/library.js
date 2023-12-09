'use strict'
const fs = require('fs')
const _ = require('lodash')
const path = require('path')

const lists = {}

function parse(list) {
  lists[list] = fs.readFileSync(path.join(__dirname,list+'.txt'),'utf8')
  .split('\n')
  .filter(x => x);

}

parse('truth');
parse('dare');
parse('truth-sub');
parse('dare-sub');

exports.pickDare = function(subscribed) {
  if(subscribed) {
    return _.sample(_.concat(lists['dare'], lists['dare-sub']));
  }
  return _.sample(_.concat(lists['dare']));
}

exports.pickTruth= function(subscribed) {
  if(subscribed) {
    return _.sample(_.concat(lists['truth'], lists['truth-sub']));
  }
  return _.sample(_.concat(lists['truth']));
}