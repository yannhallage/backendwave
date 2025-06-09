const express = require('express')
const route_TransactionAccount = express.Router();
const { GetAccountWave, getAllTransactionsForUser, UpdateServerRechargeAccount, GetAllAccount, CreateTransaction, DeleteAllTransaction, GetReception } = require('../controllers/myaccountwave.controller')


// ici on gere les Auths
route_TransactionAccount.get('/', GetAllAccount)
route_TransactionAccount.post('/transactions', CreateTransaction);
route_TransactionAccount.get('/transactions/:numeroTel', getAllTransactionsForUser)
// route_TransactionAccount.get('/transactions/:id', GetAllTransactions)
route_TransactionAccount.get('/reception/:id', GetReception)
route_TransactionAccount.get('/:id', GetAccountWave)
route_TransactionAccount.post('/:id', GetAccountWave)
route_TransactionAccount.put('/Erecharge', UpdateServerRechargeAccount)
route_TransactionAccount.delete('/suppressions', DeleteAllTransaction)

module.exports = route_TransactionAccount;