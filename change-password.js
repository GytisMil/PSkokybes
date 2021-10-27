const { verifyToken } = require('./verifyToken');
const { User, validatePassword } = require('../../models/user');
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();

router.post('/', verifyToken, async (req, res) =>{
    const { _id } = req.user;
    if(req.body.newPassword !== req.body.confirmNewPassword) {
        return res.status(400).send({'newPasswordConfirm': "New Password and Confirm New Password fields do not match!"});
    }

    let user = await User.findOne({ _id: _id });
    if(!user) {
        return res.status(400).send({'currentPass':"Authentication error. Try to login again."});
    }
    const validPassword = await bcrypt.compare(req.body.currentPassword, user.password);
    if (!validPassword) {
        return res.status(400).send({'currentPass':'Incorrect Current Password.'});
    }
    var newObj = {'password': req.body.newPassword};
    const { error } = validatePassword(newObj);
    if (error) {
        return res.status(400).send({'newPassword': error.details[0].message});
    }
    var pass =req.body.newPassword;
    const salt = await bcrypt.genSalt(10);
    pass = await bcrypt.hash(pass, salt);

     await User.findOneAndUpdate({ _id: _id }, {password: pass}, function(err, result){
        if(err){
                res.status(400).send({'error': err});
        }
        else{
            if(user){
                res.send({'successPassword': "Your password has been successfully changed."});
            }
        }
    });
});

module.exports = router;