const pandoc = require('./pandoc');

exports.Convert = class Convert {
  async find (params) {
    const {input, inputFormat, outputFormat} = params.query;
    return await pandoc(input, inputFormat, outputFormat);
  }

  async create (data) {
    const {input, inputFormat, outputFormat} = data;
    return await pandoc(input, inputFormat, outputFormat);
  }
};
