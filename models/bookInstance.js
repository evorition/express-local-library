const mongoose = require('mongoose');
const {DateTime} = require('luxon');

const BookInstanceSchema = new mongoose.Schema(
    {
      book: {type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true},
      imprint: {type: String, required: true},
      status: {
        type: String,
        required: true,
        enum: ['Available', 'Maintenance', 'Loaned', 'Reserved'],
        default: 'Maintenance',
      },
      dueBack: {type: Date, default: Date.now},
    },
);

// Virtual for bookInstance's URL
BookInstanceSchema
    .virtual('url')
    .get(function() {
      return `/catalog/bookInstance/${this._id}`;
    });

BookInstanceSchema
    .virtual('dueBackFormatted')
    .get(function() {
      return DateTime.fromJSDate(this.dueBack)
          .toLocaleString(DateTime.DATE_MED);
    });

BookInstanceSchema
    .virtual('ISODueBackDate')
    .get(function() {
      return DateTime.fromJSDate(this.dueBack).toISODate();
    });

module.exports = mongoose.model('BookInstance', BookInstanceSchema);
