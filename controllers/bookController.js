const {body, validationResult} = require('express-validator');
const Book = require('../models/book');
const Author = require('../models/author');
const Genre = require('../models/genre');
const BookInstance = require('../models/bookInstance');

exports.index = async (req, res) => {
  const results = await Promise.all([
    Book.countDocuments({}),
    BookInstance.countDocuments({}),
    BookInstance.countDocuments({status: 'Available'}),
    Author.countDocuments({}),
    Genre.countDocuments({}),
  ]);
  res.render('index', {title: 'Local Library Home', data: results});
};

// Display list of all books.
exports.bookList = async (req, res, next) => {
  try {
    const bookList = await Book.find({}, 'title author')
        .sort({title: 1})
        .populate('author')
        .exec();
    res.render('book_list', {title: 'Book list', bookList: bookList});
  } catch (err) {
    return next(err);
  }
};

// Display detail page for a specific book.
exports.bookDetail = async (req, res, next) => {
  try {
    const [book, bookInstances] = await Promise.all([
      Book.findById(req.params.id)
          .populate('author')
          .populate('genre')
          .exec(),
      BookInstance.find({book: req.params.id})
          .exec(),
    ]);
    if (book === null) {
      const err = new Error('Book not found');
      err.status = 404;
      return next(err);
    }
    res.render('book_detail',
        {title: book.title, book: book, bookInstances: bookInstances});
  } catch (err) {
    return next(err);
  }
};

// Display book create form on GET.
exports.bookCreateGet = async (req, res, next) => {
  try {
    const [authors, genres] = await Promise.all([
      Author.find().exec(),
      Genre.find().exec(),
    ]);
    res.render('book_form',
        {title: 'Create Book', authors: authors, genres: genres});
  } catch (err) {
    return next(err);
  }
};

// Handle book create on POST.
exports.bookCreatePost = [
  // Convert the genre to an array.
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === 'undefined') {
        req.body.genre = [];
      } else {
        req.body.genre = new Array(req.body.genre);
      }
    }
    next();
  },

  // Validate and sanitize fields.
  body('title', 'Title must not be empty.')
      .trim()
      .isLength({min: 1})
      .escape(),
  body('author', 'Author must not be empty.')
      .trim()
      .isLength({min: 1})
      .escape(),
  body('summary', 'Summary must no be empty.')
      .trim()
      .isLength({min: 1})
      .escape(),
  body('isbn', 'ISBN must not be empty')
      .trim()
      .isLength({min: 1})
      .escape(),
  body('genre.*')
      .escape(),

  // Process request after validation and sanitization.
  async (req, res, next) => {
    try {
      // Extract the validation errors from a request.
      const errors = validationResult(req);

      // Create a Book object with escaped and trimmed data.
      const book = new Book(
          {
            title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: req.body.genre,
          });

      if (!errors.isEmpty()) {
        // There are errors.
        // Render form again with sanitized values/error messages.
        const [authors, genres] = await Promise.all([
          Author
              .find()
              .exec(),
          Genre
              .find()
              .exec(),
        ]);

        for (let i = 0; i < genres.length; ++i) {
          if (book.genre.indexOf(genres[i]._id)) {
            genres[i].checked = true;
          }
        }
        res.render('book_form',
            {
              title: 'Create Book',
              authors: authors,
              genres: genres,
              book: book,
              errors: errors.array(),
            });
      } else {
        await book.save();
        res.redirect(book.url);
      }
    } catch (err) {
      return next(err);
    }
  },
];

// Display book delete form on GET.
exports.bookDeleteGet = async (req, res, next) => {
  try {
    const [book, bookInstances] = await Promise.all([
      Book.findById(req.params.id).exec(),
      BookInstance.find({book: req.params.id}).exec(),
    ]);
    if (book === null) {
      res.redirect('/catalog/books');
    }
    res.render('book_delete',
        {title: 'Delete Book', book: book, bookInstances: bookInstances});
  } catch (err) {
    return next(err);
  }
};

// Handle book delete on POST.
exports.bookDeletePost = async (req, res, next) => {
  try {
    const [book, bookInstances] = await Promise.all([
      Book.findById(req.body.bookid).exec(),
      BookInstance.find({book: req.body.bookid}).exec(),
    ]);
    if (bookInstances.length > 0) {
      res.render('book_delete',
          {title: 'Delete Book', book: book, bookInstances: bookInstances});
    } else {
      Book.findByIdAndRemove(req.body.bookid, (err) => {
        if (err) {
          return next(err);
        }
        res.redirect('/catalog/books');
      });
    }
  } catch (err) {
    return next(err);
  }
};

// Display book update form on GET.
exports.bookUpdateGet = async (req, res, next) => {
  try {
    const [book, authors, genres] = await Promise.all([
      Book
          .findById(req.params.id)
          .populate('author')
          .populate('genre')
          .exec(),
      Author
          .find({})
          .exec(),
      Genre
          .find({})
          .exec(),
    ]);
    // No results
    if (book === null) {
      const err = new Error('Book not found');
      err.status = 404;
      return next(err);
    }
    // Success.
    // Mark our selected genres as checked.
    for (let g = 0; g < genres.length; ++g) {
      for (let b = 0; b < book.genre.length; ++b) {
        if (genres[g]._id.toString() === book.genre[b]._id.toString()) {
          genres[g].checked = 'true';
          break;
        }
      }
    }
    res.render('book_form',
        {title: 'Update Book', authors: authors, genres: genres, book: book});
  } catch (err) {
    return next(err);
  }
};

// Handle book update on POST.
exports.bookUpdatePost = [
  // Convert the genre to array
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === 'undefined') {
        req.body.genre = [];
      } else {
        req.body.genre = new Array(req.body.genre);
      }
    }
    next();
  },

  // Validate and sanitize fields.
  body('title', 'Title must not be empty')
      .trim()
      .isLength({min: 1})
      .escape(),
  body('author', 'Author must not be empty.')
      .trim()
      .isLength({min: 1})
      .escape(),
  body('summary', 'Summary must not be empty.')
      .trim()
      .isLength({min: 1})
      .escape(),
  body('isbn', 'ISBN must not be empty')
      .trim()
      .isLength({min: 1})
      .escape(),
  body('genre.*')
      .escape(),

  // Process request after validation and sanitization.
  async (req, res, next) => {
    try {
      // Extract the validation errors from a request.
      const errors = validationResult(req);

      // Create a Book object with escaped/trimmed data and old id.
      const book = new Book({
        title: req.body.title,
        author: req.body.author,
        summary: req.body.summary,
        isbn: req.body.isbn,
        genre: (typeof req.body.genre === 'undefined') ? [] : req.body.genre,
        _id: req.params.id, // This is required, or a new ID will be assigned!
      });

      if (!errors.isEmpty()) {
        // There are errors.
        // Render form again with sanitized values/error messages.
        const [authors, genres] = await Promise.all([
          Author
              .find({})
              .exec(),
          Genre
              .find({})
              .exec(),
        ]);

        // Mark our selected genres as checked
        for (let i = 0; i < genres.length; ++i) {
          if (book.genre.indexOf(genres[i]._id) > -1) {
            genres[i].checked = 'true';
          }
        }
        res.render('book_form',
            {
              title: 'Update Book',
              authors: authors,
              genres: genres,
              book: book,
              errors: errors.array(),
            });
      } else {
        // Data from form is valid. Update the record.
        Book.findByIdAndUpdate(req.params.id, book, {}, (err, book) => {
          if (err) {
            return next(err);
          }
          // Successful - redirect to book detail page.
          res.redirect(book.url);
        });
      }
    } catch (err) {
      return next(err);
    }
  },
];
