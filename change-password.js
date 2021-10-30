const { verifyToken } = require('./verifyToken');
const { User, validatePassword } = require('../../models/user');
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();

router.post('/', verifyToken, async (req, res) =>{
    const user_id = req.user._id;

    let user = await User.findOne({ _id: user_id });
    if(!user) {
        return res.status(401).send({'currentPass':"Authentication error. Try to login again."});
    }
    compareAndValidatePasswords(req.body.currentPassword, user.password);
    var pass =req.body.newPassword;
    const salt = await bcrypt.genSalt(10);
    var hashed_password = await bcrypt.hash(pass, salt);
     await User.findOneAndUpdate({ _id: user_id }, {password: hashed_password}, function(err){
        if (err) {
            res.status(400).send({ 'error': err });
        }
        else {
            res.status(200).send({ 'successPassword': "Your password has been successfully changed." });
        }
    });
});
function compareAndValidatePasswords(currentPassword, userPassword) {
    const validPassword = await bcrypt.compare(currentPassword, userPassword);
    var passwordValidationObj = { 'password': req.body.newPassword };
    
    if(req.body.newPassword !== req.body.confirmNewPassword) {
        return res.status(400).send({'newPasswordConfirm': "New Password and Confirm New Password fields do not match!"});
    }
    if (!validPassword) {
        return res.status(400).send({'currentPass':'Incorrect Current Password.'});
    }
    const { error } = validatePassword(passwordValidationObj);

    if (error) return res.status(400).send({ 'newPassword': error.details[0].message });
}
module.exports = router;