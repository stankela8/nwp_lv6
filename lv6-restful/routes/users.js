var express = require('express');
var router = express.Router();

/*
 * GET userlist.
 */
router.get('/userlist', async function(req, res, next) {
    try {
        var db = req.db;
        var collection = db.get('userlist');
        var docs = await collection.find({});
        res.json(docs);
    } catch (err) {
        next(err);
    }
});

/*
 * POST to adduser.
 */
router.post('/adduser', async function(req, res, next) {
    try {
        var db = req.db;
        var collection = db.get('userlist');
        var result = await collection.insert(req.body);
        res.send({ msg: '' });
    } catch (err) {
        res.send({ msg: 'error: ' + err });
    }
});

/*
 * DELETE to deleteuser.
 */
router.delete('/deleteuser/:id', async function(req, res, next) {
    try {
        var db = req.db;
        var collection = db.get('userlist');
        var userToDelete = req.params.id;
        await collection.remove({ '_id': userToDelete });
        res.send({ msg: '' });
    } catch (err) {
        res.send({ msg: 'error: ' + err });
    }
});

module.exports = router;
