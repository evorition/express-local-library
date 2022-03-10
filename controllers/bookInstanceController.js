const {body, validationResult} = require('express-validator');
const BookInstance = require('../models/bookInstance');
const Book = require('../models/book');

// Display list of all BookInstances.
exports.bookInstanceList = async (req, res, next) => {
  try {
    const listBookInstance = await BookInstance.find()
        .populate('book')
        .exec();
    res.render('bookinstance_list',
        {title: 'Book Instance List', bookInstanceList: listBookInstance});
  } catch (err) {
    return next(err);
  }
};

// Display detail page for a specific BookInstance.
exports.bookInstanceDetail = async (req, res, next) => {
  try {
    const bookInstance = await BookInstance.findById(req.params.id)
        .populate('book')
        .exec();
    if (bookInstance === null) {
      const err = new Error('Book copy not found');
      err.status_code = 404;
      return next(err);
    }
    res.render('bookinstance_detail',
        {
          title: `Copy: ${bookInstance.book.title}`,
          bookInstance: bookInstance,
        });
  } catch (err) {
    return next(err);
  }
};

// Display BookInstance create form on GET.
exports.bookInstanceCreateGet = async (req, res, next) => {
  try {
    const bookList = await Book.find({}, 'title')
        .exec();
    res.render('bookinstance_form',
        {title: 'Create BookInstance', bookList: bookList});
  } catch (e) {
    return next(e);
  }
};

// Handle BookInstance create on POST.
exports.bookInstanceCreatePost = [
  body('book', 'Book instance must be specified')
      .trim()
      .isLength({min: 1})
      .escape(),
  body('imprint', 'Imprint must be specified')
      .trim()
      .isLength({min: 1})
      .escape(),
  body('status')
      .escape(),
  body('dueBack', 'Invalid date')
      .optional({checkFalsy: true}).isISO8601().toDate(),

  // Process request after validation and sanitization.
  async (req, res, next) => {
    try {
      // Extract the validation errors from a request.
      const errors = validationResult(req);

      // Create a BookInstance object with escaped and trimmed data.
      const bookInstance = new BookInstance(
          {
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            dueBack: req.body.dueBack,
          });

      if (!errors.isEmpty()) {
        // There are errors.
        // Render form again with sanitized values and error messages.
        const books = await Book.find({}, 'title').exec();
        res.render('bookinstance_form',
            {
              title: 'Create BookInstance',
              bookInstance: bookInstance,
              bookList: books,
              errors: errors.array(),
            });
      } else {
        await bookInstance.save();
        res.redirect(bookInstance.url);
      }
    } catch (err) {
      return next(err);
    }
  },
];

// Display BookInstance delete form on GET.
exports.bookInstanceDeleteGet = async (req, res, next) => {
  try {
    const bookInstance = await BookInstance.findById(req.params.id).exec();
    if (bookInstance === null) {
      res.redirect('/catalog/bookinstances');
    }
    res.render('bookinstance_delete',
        {title: 'Delete Book Instance', bookInstance: bookInstance});
  } catch (err) {
    return next(err);
  }
};

// Handle BookInstance delete on POST.
exports.bookInstanceDeletePost = (req, res, next) => {
  BookInstance.findByIdAndRemove(req.body.bookInstanceid, (err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/catalog/bookinstances');
  });
};

// Display BookInstance update form on GET.
exports.bookInstanceUpdateGet = async (req, res, next) => {
  try {
    const [bookInstance, bookList] = await Promise.all([
      BookInstance.findById(req.params.id).populate('book').exec(),
      Book.find({}).exec(),
    ]);
    if (bookInstance === null) {
      const err = new Error('Book Instance not found.');
      err.status = 404;
      return next(err);
    }
    res.render('bookinstance_form',
        {
          title: 'Update Book Instance',
          bookInstance: bookInstance,
          bookList: bookList,
        });
  } catch (err) {
    return next(err);
  }
};

// Handle bookInstance update on POST.
exports.bookInstanceUpdatePost = [
  body('book', 'Book instance must be specified')
      .trim()
      .isLength({min: 1})
      .escape(),
  body('imprint', 'Imprint must be specified')
      .trim()
      .isLength({min: 1})
      .escape(),
  body('status')
      .escape(),
  body('dueBack', 'Invalid date')
      .optional({checkFalsy: true}).isISO8601().toDate(),

  // Process request after validation and sanitization.
  async (req, res, next) => {
    try {
      // Extract the validation errors from a request.
      const errors = validationResult(req);

      // Create a BookInstance object with escaped and trimmed data.
      const bookInstance = new BookInstance(
          {
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            dueBack: req.body.dueBack,
            _id: req.params.id,
          });

      if (!errors.isEmpty()) {
        // There are errors.
        // Render form again with sanitized values and error messages.
        const books = await Book.find({}, 'title').exec();
        res.render('bookinstance_form',
            {
              title: 'Update Book Instance',
              bookInstance: bookInstance,
              bookList: books,
              errors: errors.array(),
            });
      } else {
        BookInstance.findByIdAndUpdate(req.params.id, bookInstance, {},
            (err, bookInstance) => {
              if (err) {
                return next(err);
              }
              res.redirect(bookInstance.url);
            });
      }
    } catch (err) {
      return next(err);
    }
  },
];
