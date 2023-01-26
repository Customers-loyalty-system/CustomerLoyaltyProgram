const models = require("../models");
const { failedWithMessage, createdWithMessage } = require("../responser/responses");
const { addBill } = require("../services/billServices");

const store = async (req, res, next) => {
    
    try { 
        const bill = await addBill(req.body)
        if(bill) createdWithMessage('bill added successfully', res, bill)
        else failedWithMessage('Email wrong, Please login or register your company', res)
    }
    catch(err) { 
        return failedWithMessage(err.message, res)
    }
};

module.exports = {
  store,
};
