const mongoose = require('mongoose');
const {DateTime} = require('luxon');

const AuthorSchema = new mongoose.Schema(
    {
      firstName: {type: String, required: true, maxLength: 100},
      familyName: {type: String, required: true, maxLength: 100},
      dateOfBirth: {type: Date},
      dateOfDeath: {type: Date},
    },
);

// Virtual for author's full name
AuthorSchema
    .virtual('name')
    .get(function() {
      let fullname = '';
      if (this.firstName && this.familyName) {
        fullname = `${this.familyName}, ${this.firstName}`;
      }
      return fullname;
    });

// Virtual for author's lifespan
AuthorSchema
    .virtual('lifespan')
    .get(function() {
      let lifetimeString = '';
      if (this.dateOfBirth) {
        lifetimeString = DateTime.fromJSDate(this.dateOfBirth)
            .toLocaleString(DateTime.DATE_MED);
      }
      lifetimeString += ' - ';
      if (this.dateOfDeath) {
        lifetimeString += DateTime.fromJSDate(this.dateOfDeath)
            .toLocaleString(DateTime.DATE_MED);
      }
      return lifetimeString;
    });

// Virtual for author's URL
AuthorSchema
    .virtual('url')
    .get(function() {
      return `/catalog/author/${this._id}`;
    });

AuthorSchema
    .virtual('ISODateOfBirth')
    .get(function() {
      return DateTime.fromJSDate(this.dateOfBirth).toISODate();
    });

AuthorSchema
    .virtual('ISODateOfDeath')
    .get(function() {
      return DateTime.fromJSDate(this.dateOfDeath).toISODate();
    });


module.exports = mongoose.model('Author', AuthorSchema);
