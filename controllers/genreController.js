const {body, validationResult} = require('express-validator');
const Genre = require('../models/genre');
const Book = require('../models/book');

// Display list of all Genre.
exports.genreList = async (req, res, next) => {
  try {
    const genreList = await Genre.find()
        .sort('name')
        .exec();
    res.render('genre_list', {title: 'Genre List', genreList: genreList});
  } catch (err) {
    return next(err);
  }
};

// Display detail page for a specific Genre.
exports.genreDetail = async (req, res, next) => {
  try {
    const [genre, genreBooks] = await Promise.all([
      Genre.findById(req.params.id).exec(),
      Book.find({genre: req.params.id}).exec(),
    ]);
    if (genre === null) {
      const err = new Error('Genre not found');
      err.status = 404;
      return next(err);
    }
    res.render('genre_detail',
        {title: 'Genre Details', genre: genre, genreBooks: genreBooks});
  } catch (err) {
    return next(err);
  }
};

// Display Genre create form on GET.
exports.genreCreateGet = (req, res) => {
  res.render('genre_form', {title: 'Create Genre'});
};

// Handle Genre create on POST.
exports.genreCreatePost = [
  // Validate and sanitize the name field
  body('name', 'Genre name required').trim().isLength({min: 1}).escape(),

  // Process request after validation and sanitization.
  async (req, res, next) => {
    try {
      // Extract the validation errors from a request.
      const errors = validationResult(req);

      // Create a genre object with escaped and trimmed data.
      const genre = new Genre(
          {name: req.body.name},
      );

      if (!errors.isEmpty()) {
        // There are errors.
        // Render the form again with sanitized values/error messages.
        res.render('genre_form',
            {title: 'Create Genre', genre: genre, errors: errors.array()});
      } else {
        // Data from form is valid.
        // Check if Genre with same name already exists.
        const foundGenre = await Genre.findOne({name: req.body.name})
            .exec();
        if (foundGenre) {
          // Genre exists, redirect to its detail page.
          res.redirect(foundGenre.url);
        }
        await genre.save();
        res.redirect(genre.url);
      }
    } catch (err) {
      return next(err);
    }
  },
];

// Display Genre delete form on GET.
exports.genreDeleteGet = async (req, res, next) => {
  try {
    const [genre, books] = await Promise.all([
      Genre.findById(req.params.id).exec(),
      Book.find({genre: req.params.id}).exec(),
    ]);

    if (genre === null) {
      res.redirect('/catalog/genres');
    }

    res.render('genre_delete',
        {title: 'Delete Genre', genre: genre, books: books});
  } catch (err) {
    return next(err);
  }
};

// Handle Genre delete on POST.
exports.genreDeletePost = async (req, res, next) => {
  try {
    const [genre, books] = await Promise.all([
      Genre.findById(req.body.genreid).exec(),
      Book.find({genre: req.body.genreid}).exec(),
    ]);
    if (books.length > 0) {
      res.render('genre_delete',
          {title: 'Delete Genre', genre: genre, books: books});
    } else {
      Genre.findByIdAndRemove(req.body.genreid, (err) => {
        if (err) {
          return next(err);
        }
        res.redirect('/catalog/genres');
      });
    }
  } catch (err) {
    return next(err);
  }
};

// Display Genre update form on GET.
exports.genreUpdateGet = async (req, res, next) => {
  try {
    const genre = await Genre.findById(req.params.id).exec();
    if (genre === null) {
      const err = new Error('Genre not found');
      err.status = 404;
      return next(err);
    }
    res.render('genre_form', {title: 'Update Genre', genre: genre});
  } catch (err) {
    return next(err);
  }
};

exports.genreUpdatePost = [
  // Validate and sanitize the name field
  body('name', 'Genre name required').trim().isLength({min: 1}).escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a genre object with escaped/trimmed data and old id.
    const genre = new Genre({name: req.body.name, _id: req.params.id});

    if (!errors.isEmpty()) {
      // There are errors.
      // Render the form again with sanitized values/error messages.
      res.render('genre_form',
          {title: 'Update Genre', genre: genre, errors: errors.array()});
    } else {
      // Data from form is valid.
      Genre.findByIdAndUpdate(req.params.id, genre, {}, (err, genre) => {
        if (err) {
          return next(err);
        }
        res.redirect(genre.url);
      });
    }
  },
];
