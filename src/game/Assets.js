const path = require('path');
const fs = require('fs');
const { loadImage } = require('canvas');

const ASSET_PATH = path.join(__dirname, '..', '..', 'assets', 'game');

const assetsCollection = {};

class Assets {
  static load() {
    Assets.traverse(ASSET_PATH, assetsCollection);
  }

  /**
   * @param {string} assetPath
   * @param {{}} objRef
   */
  static traverse(assetPath, objRef) {
    fs.readdirSync(assetPath).forEach((source) => {
      const sourcePath = path.join(assetPath, source);
      const isDirectory = fs.lstatSync(sourcePath).isDirectory();

      if(isDirectory) {
        objRef[source] = {};

        Assets.traverse(sourcePath, objRef[source]);
      } else {
        loadImage(sourcePath).then((image) => {
          const objNameSplit = source.split('.');
          objNameSplit.pop();

          const objName = objNameSplit.join(".");

          objRef[objName] = image;
        });
      }
    });
  }

  /**
   * @returns {{}}
   */
  static get get() {
    return assetsCollection;
  }
}

module.exports = Assets;