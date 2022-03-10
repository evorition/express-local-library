const {body, validationResult} = require('express-validator');
const Author = require('../models/author');
const Book = require('../models/book');

// Display list of all Authors.
exports.authorList = async (req, res, next) => {
  try {
    const authorList = await Author.find({}).sort('familyName').exec();
    res.render('author_list', {
      title: 'Author List',
      authorList: authorList,
    });
  } catch (err) {
    return next(err);
  }
};

// Display detail page for a specific Author.
exports.authorDetail = async (req, res, next) => {
  try {
    const [author, authorBooks] = await Promise.all([
      Author.findById(req.params.id).exec(),
      Book.find({author: req.params.id}, 'title summary').exec(),
    ]);
    if (author === null) {
      const err = new Error('Author not found');
      err.status = 404;
      return next(err);
    }
    res.render('author_detail', {
      title: 'Author Detail',
      author: author,
      authorBooks: authorBooks,
    });
  } catch (err) {
    return next(err);
  }
};

// Display Author create form on GET.
exports.authorCreateGet = (req, res, next) => {
  res.render('author_form', {title: 'Create Author'});
};

// Handle Author create on POST.
exports.authorCreatePost = [
  body('firstName')
      .trim()
      .isLength({min: 1})
      .escape()
      .withMessage('First name must be specified')
      .isAlphanumeric()
      .withMessage('First name has non-alphanumeric characters.'),
  body('familyName')
      .trim()
      .isLength({min: 1})
      .escape()
      .withMessage('Family name must be specified')
      .isAlphanumeric()
      .withMessage('Family name has non-alphanumeric charcters.'),
  body('dateOfBirth', 'Invalid date of birth')
      .optional({checkFalsy: true})
      .isISO8601()
      .toDate(),
  body('dateOfDeath', 'Invalid date of death')
      .optional({checkFalsy: true})
      .isISO8601()
      .toDate(),

  // Process request after validation and sanitization.
  async (req, res, next) => {
    try {
      // Extract the validation errors from a request.
      const errors = validationResult(req);

      // Create an Author object with escaped and trimmed data.
      const author = new Author({
        firstName: req.body.firstName,
        familyName: req.body.familyName,
        dateOfBirth: req.body.dateOfBirth,
        dateOfDeath: req.body.dateOfDeath,
      });

      if (!errors.isEmpty()) {
        // There are errors.
        // Render form again with sanitized values/errors messages.
        res.render('author_form', {
          title: 'Create Author',
          author: author,
          errors: errors.array(),
        });
      } else {
        // Data from form is valid.
        await author.save();
        res.redirect(author.url);
      }
    } catch (err) {
      return next(err);
    }
  },
];

// Display Author delete form on GET.
exports.authorDeleteGet = async (req, res, next) => {
  try {
    const [author, authorsBooks] = await Promise.all([
      Author.findById(req.params.id).exec(),
      Book.find({author: req.params.id}).exec(),
    ]);
    if (author === null) {
      res.redirect('/catalog/authors');
    }
    // Successful, so render.
    res.render('author_delete', {
      title: 'Delete Author',
      author: author,
      authorBooks: authorsBooks,
    });
  } catch (err) {
    return next(err);
  }
};

// Handle Author delete on POST.
exports.authorDeletePost = async (req, res, next) => {
  try {
    const [author, authorBooks] = await Promise.all([
      Author.findById(req.body.authorid).exec(),
      Book.find({author: req.body.authorid}).exec(),
    ]);
    if (authorBooks.length > 0) {
      // Author has books. Render in same way as for GET route.
      res.render('author_delete', {
        title: 'Delete Author',
        author: author,
        authorBooks: authorBooks,
      });
    } else {
      // Author has no books. Delete object and redirect to the list of authors.
      Author.findByIdAndRemove(req.body.authorid, (err) => {
        if (err) {
          return next(err);
        }
        // Success - go to author list
        res.redirect('/catalog/authors');
      });
    }
  } catch (err) {
    return next(err);
  }
};

// Display Author update form on GET.
exports.authorUpdateGet = async (req, res, next) => {
  try {
    const author = await Author.findById(req.params.id).exec();
    if (author === null) {
      const err = new Error('Author not found');
      err.status = 404;
      return next(err);
    }
    res.render('author_form', {title: 'Update Author', author: author});
  } catch (err) {
    return next(err);
  }
};

// Handle Author update on POST.
exports.authorUpdatePost = [
  body('firstName')
      .trim()
      .isLength({min: 1})
      .escape()
      .withMessage('First name must be specified')
      .isAlphanumeric()
      .withMessage('First name has non-alphanumeric characters.'),
  body('familyName')
      .trim()
      .isLength({min: 1})
      .escape()
      .withMessage('Family name must be specified')
      .isAlphanumeric()
      .withMessage('Family name has non-alphanumeric charcters.'),
  body('dateOfBirth', 'Invalid date of birth')
      .optional({checkFalsy: true})
      .isISO8601()
      .toDate(),
  body('dateOfDeath', 'Invalid date of death')
      .optional({checkFalsy: true})
      .isISO8601()
      .toDate(),

  // Process request after validation and sanitization.
  async (req, res, next) => {
    try {
      // Extract the validation errors from a request.
      const errors = validationResult(req);

      // Create an Author object with escaped and trimmed data.
      const author = new Author({
        firstName: req.body.firstName,
        familyName: req.body.familyName,
        dateOfBirth: req.body.dateOfBirth,
        dateOfDeath: req.body.dateOfDeath,
        _id: req.params.id,
      });

      if (!errors.isEmpty()) {
        // There are errors.
        // Render form again with sanitized values/errors messages.
        res.render('author_form', {
          title: 'Update Author',
          author: author,
          errors: errors.array(),
        });
      } else {
        // Data from form is valid.
        Author.findByIdAndUpdate(req.params.id, author, {}, (err, author) => {
          if (err) {
            return next(err);
          }
          res.redirect(author.url);
        });
      }
    } catch (err) {
      return next(err);
    }
  },
];
