var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), // mongo connection
    bodyParser = require('body-parser'), // parses information from POST
    methodOverride = require('method-override'); // used to manipulate POST

// Any requests to this controller must pass through this 'use' function
// Copy and pasted from method-override
router.use(bodyParser.urlencoded({ extended: true }))
router.use(methodOverride(function(req, res){
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
    }
}));

// Build the REST operations at the base for blobs
// This will be accessible from http://127.0.0.1:3000/blobs if the default route for / is left unchanged
router.route('/')
    // GET all blobs
    .get(async function(req, res, next) {
        try {
            // retrieve all blobs from MongoDB using promises
            var blobs = await mongoose.model('Blob').find({});
            res.format({
                // HTML response will render the index.jade file in the views/blobs folder.
                // We are also setting "blobs" to be an accessible variable in our jade view
                html: function(){
                    res.render('blobs/index', {
                        title: 'All my Blobs',
                        "blobs" : blobs
                    });
                },
                // JSON response will show all blobs in JSON format
                json: function(){
                    res.json(blobs);
                }
            });
        } catch (err) {
            next(err);
        }
    })
    // POST a new blob
    .post(async function(req, res) {
        try {
            var blob = req.body;
            // call the create function for our database using promises
            var createdBlob = await mongoose.model('Blob').create(blob);
            res.format({
                // HTML response will redirect back to the home page
                html: function(){
                    res.location("blobs");
                    res.redirect("/blobs");
                },
                // JSON response will show the newly created blob
                json: function(){
                    res.json(createdBlob);
                }
            });
        } catch (err) {
            res.send({ msg: 'error: ' + err });
        }
    });

/* GET New Blob page. */
router.get('/new', function(req, res) {
    res.render('blobs/new', { title: 'Add New Blob' });
});

// Route middleware to validate :id
router.param('id', async function(req, res, next, id) {
    try {
        // find the ID in the Database using promises
        var blob = await mongoose.model('Blob').findById(id);
        if (!blob) {
            var err = new Error('Not Found');
            err.status = 404;
            next(err);
        } else {
            // save the new item in the req
            req.id = id;
            next(); 
        }
    } catch (err) {
        next(err);
    }
});

router.route('/:id')
    .get(async function(req, res, next) {
        try {
            var blob = await mongoose.model('Blob').findById(req.id);
            if (!blob) {
                var err = new Error('Not Found');
                err.status = 404;
                next(err);
            } else {
                var blobdob = blob.dob.toISOString().substring(0, blob.dob.toISOString().indexOf('T'));
                res.format({
                    html: function(){
                        res.render('blobs/show', {
                            "blobdob" : blobdob,
                            "blob" : blob
                        });
                    },
                    json: function(){
                        res.json(blob);
                    }
                });
            }
        } catch (err) {
            next(err);
        }
    });

router.route('/:id/edit')
    .get(async function(req, res, next) {
        try {
            var blob = await mongoose.model('Blob').findById(req.id);
            if (!blob) {
                var err = new Error('Not Found');
                err.status = 404;
                next(err);
            } else {
                var blobdob = blob.dob.toISOString().substring(0, blob.dob.toISOString().indexOf('T'));
                res.format({
                    html: function(){
                        res.render('blobs/edit', {
                            title: 'Blob' + blob._id,
                            "blobdob" : blobdob,
                            "blob" : blob
                        });
                    },
                    json: function(){
                        res.json(blob);
                    }
                });
            }
        } catch (err) {
            next(err);
        }
    })
    .put(async function(req, res, next) {
		try {
			var updateData = req.body;
			// Convert isloved to a boolean if it's a string
			if (updateData.isloved === 'on') {
				updateData.isloved = true;
			} else if (updateData.isloved === 'off') {
				updateData.isloved = false;
			}
			var updatedBlob = await mongoose.model('Blob').findByIdAndUpdate(req.id, updateData, { new: true });
			res.format({
				html: function(){
					res.redirect("/blobs/" + updatedBlob._id);
				},
				json: function(){
					res.json(updatedBlob);
				}
			});
		} catch (err) {
			res.send("There was a problem updating the information to the database: " + err);
		}
	})
    .delete(async function (req, res) {
		try {
			var deletedBlob = await mongoose.model('Blob').findOneAndDelete({ _id: req.id });
			if (!deletedBlob) {
				return res.status(404).send({ message: 'Blob not found' });
			}
			console.log('DELETE removing ID: ' + deletedBlob._id);
			res.format({
				html: function () {
					res.redirect("/blobs");
				},
				json: function () {
					res.json({ message: 'deleted', item: deletedBlob });
				}
			});
		} catch (err) {
			res.status(500).send("Error deleting blob: " + err);
		}
	});


module.exports = router;
