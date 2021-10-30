const express = require('express');
const { Likes } = require('../../../models/likes');
const { Drawings } = require('../../../models/drawing');
const { User } = require('../../../models/user');
const { verifyToken } = require("../verifyToken");

const router = express.Router();

router.post('/', verifyToken, async (req, res) => {
    Likes.deleteOne({postID: req.body.postID, userID: req.user._id}).then(result => {
        if(result.deletedCount != 0){
			updateLikeObject(req.body.author_username, req.body.postID, -1, false);
        }
        else{
            let like = new Likes({
                postID: req.body.postID,
                userID: req.user._id
            });
            like.save().then(()=>{
				updateLikeObject(req.body.author_username, req.body.postID, 1, true);
            })
            .catch((err)=>{
                res.status(400).send(err);
            })
        }
    });

});
function updateLikeObject(username, postID, likeIncrement, likeState) {
	Drawings.findOneAndUpdate({_id: postID}, {$inc: { like_count: likeIncrement }}, (err, response)=>{
		if(err)
			res.status(400).send(err)
        else if(username) {
			User.findOneAndUpdate({username: username}, {$inc: { total_like_count: likeIncrement }}, (err, response)=>{
				if(err)
					res.status(400).send(err);
				else
					return res.status(200).send({'status':likeState});
            });
		}
        else
			return res.status(200).send({'status':likeState});
    });
}
module.exports = router;