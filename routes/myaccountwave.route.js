const express = require('express')
const route_authentifcation = express.Router();
const { GetAccountWave, GetAllTransactions, GetAllAccount, CreateTransaction, DeleteAllTransaction,GetReception } = require('../controllers/myaccountwave.controller')


// ici on gere les Auths
route_authentifcation.get('/', GetAllAccount)
route_authentifcation.post('/transactions', CreateTransaction);
route_authentifcation.get('/transactions/:id', GetAllTransactions)
route_authentifcation.get('/reception/:id', GetReception)
route_authentifcation.get('/:id', GetAccountWave)
route_authentifcation.post('/:id', GetAccountWave)
route_authentifcation.delete('/suppressions', DeleteAllTransaction)

module.exports = route_authentifcation;