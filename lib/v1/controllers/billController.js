const models = require("../models");


const store = async (req, res, next) => {
    const {billNumber, billReference, amount, phone, companyEmail} = req.body
    console.log(billNumber, billReference, amount, phone, companyEmail)
    console.log(phone)
    if (!phone) {
        res.send('No Number')
        return res.status(407)
    }
    res.status(201)
    res.send('Ok')
} 

module.exports = { 
    store
}