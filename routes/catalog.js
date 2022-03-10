const express = require('express');
const router = express.Router();

const bookController = require('../controllers/bookController');
const authorController = require('../controllers/authorController');
const genreController = require('../controllers/genreController');
const bookInstanceController = require('../controllers/bookInstanceController');

// / BOOK ROUTES ///

// GET catalog home page.
router.get('/', bookController.index);

// GET request for creating a Book.
// NOTE This must come before routes that display Book (uses id).
router.get('/book/create', bookController.bookCreateGet);

// POST request for creating Book.
router.post('/book/create', bookController.bookCreatePost);

// GET request to delete Book.
router.get('/book/:id/delete', bookController.bookDeleteGet);

// POST request to delete Book.
router.post('/book/:id/delete', bookController.bookDeletePost);

// GET request to update Book.
router.get('/book/:id/update', bookController.bookUpdateGet);

// POST request to update Book.
router.post('/book/:id/update', bookController.bookUpdatePost);

// GET request for one Book.
router.get('/book/:id', bookController.bookDetail);

// GET request for list of all Book items.
router.get('/books', bookController.bookList);

// / AUTHOR ROUTES ///

// GET request for creating Author.
// NOTE This must come before route for id (i.e. display author).
router.get('/author/create', authorController.authorCreateGet);

// POST request for creating Author.
router.post('/author/create', authorController.authorCreatePost);

// GET request to delete Author.
router.get('/author/:id/delete', authorController.authorDeleteGet);

// POST request to delete Author.
router.post('/author/:id/delete', authorController.authorDeletePost);

// GET request to update Author.
router.get('/author/:id/update', authorController.authorUpdateGet);

// POST request to update Author.
router.post('/author/:id/update', authorController.authorUpdatePost);

// GET request for one Author.
router.get('/author/:id', authorController.authorDetail);

// GET request for list of all Authors.
router.get('/authors', authorController.authorList);

// / GENRE ROUTES ///

// GET request for creating a Genre.
// NOTE This must come before route that displays Genre (uses id).
router.get('/genre/create', genreController.genreCreateGet);

// POST request for creating Genre.
router.post('/genre/create', genreController.genreCreatePost);

// GET request to delete Genre.
router.get('/genre/:id/delete', genreController.genreDeleteGet);

// POST request to delete Genre.
router.post('/genre/:id/delete', genreController.genreDeletePost);

// GET request to update Genre.
router.get('/genre/:id/update', genreController.genreUpdateGet);

// POST request to update Genre.
router.post('/genre/:id/update', genreController.genreUpdatePost);

// GET request for one Genre.
router.get('/genre/:id', genreController.genreDetail);

// GET request for list of all Genre.
router.get('/genres', genreController.genreList);

// / BOOKINSTANCE ROUTES ///

// GET request for creating a BookInstance.
// NOTE This must come before route that displays BookInstance (uses id).
router.get('/bookInstance/create',
    bookInstanceController.bookInstanceCreateGet);

// POST request for creating BookInstance.
router.post('/bookInstance/create',
    bookInstanceController.bookInstanceCreatePost);

// GET request to delete BookInstance.
router.get('/bookInstance/:id/delete',
    bookInstanceController.bookInstanceDeleteGet);

// POST request to delete BookInstance.
router.post('/bookInstance/:id/delete',
    bookInstanceController.bookInstanceDeletePost);

// GET request to update BookInstance.
router.get('/bookInstance/:id/update',
    bookInstanceController.bookInstanceUpdateGet);

// POST request to update BookInstance.
router.post('/bookInstance/:id/update',
    bookInstanceController.bookInstanceUpdatePost);

// GET request for one BookInstance.
router.get('/bookInstance/:id', bookInstanceController.bookInstanceDetail);

// GET request for list of all BookInstance.
router.get('/bookInstances', bookInstanceController.bookInstanceList);

module.exports = router;
