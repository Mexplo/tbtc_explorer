import React from 'react';

export function addressFormatter(address, useEtherScan = true) {
  if (address && address.length) {
    let addressStart = address.substring(0, 7);
    let addressEnd = address.substring(address.length - 4);
    let hashLink = 'https://etherscan.io/address/' + address;
    let addressWord = addressStart + '...' + addressEnd;

    if (!useEtherScan) {
      return addressWord;
    }
    return <a href={hashLink} target="_blank">{ addressWord }</a>;
  }
  return '';
}

export function txFormatter(address) {
  if (address && address.length) {
    let addressStart = address.substring(0, 7);
    let addressEnd = address.substring(address.length - 4);
    let hashLink = 'https://etherscan.io/tx/' + address;
    let addressWord = addressStart + '...' + addressEnd;

    return <a href={hashLink} target="_blank">{ addressWord }</a>;
  }
  return '';
}
