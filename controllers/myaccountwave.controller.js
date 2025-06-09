const AccountWave = require('../models/accountwave.model');
const TransactionRecent = require('../models/transactionRecent.model')
const TransactionReception = require('../models/transactionReception.model')
require('dotenv').config();
const jwt = require('jsonwebtoken');


const GetAccountWave = async (req, res) => {
    try {
        const { id } = req.params
        const accountWave_personnel = await AccountWave.findById(id)

        if (!accountWave_personnel) {
            return res.status(404).json({ message: "le compte wave pas trouvé" })
        }

        return res.status(200).json({
            accountWave_personnel
        })
    }
    catch (error) {
        return res.status(500).json({ message: "une erreur est survenue lors de la recuperation du personnel" })
    }
}

const GetAllTransactions = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("Recherche transactions pour id:", id);

        const transactions = await TransactionRecent.find({ numero_expediteur: id });
        console.log("Transactions trouvées :", transactions);

        if (!transactions || transactions.length === 0) {
            return res.status(404).json({ message: "Aucune transaction trouvée pour ce numéro" });
        }

        return res.status(200).json({ transactions });
    } catch (error) {
        console.error("Erreur lors de la récupération des transactions :", error);
        return res.status(500).json({ message: "Erreur serveur" });
    }
};

const GetReception = async (req, res) => {
    try {
        const { id } = req.params;
        const reception = await TransactionReception.find({ numero_destinataire: id });
        if (!reception) {
            return res.status(404).json({ message: "Aucune transaction de reception trouvé" })
        }
        return res.status(200).json({ reception })
    } catch (erro) {
        return res.status(500).json({
            message: "une erreur est survenue lors de la recuperation des donnees de receptions "
        })
    }
}

const CreateTransaction = async (req, res) => {
    try {
        const {
            numero_expediteur,
            numero_destinataire,
            montant,
            dateTransaction
        } = req.body;

        if (
            numero_expediteur === undefined ||
            !numero_destinataire ||
            !montant ||
            !dateTransaction
        ) {
            return res.status(400).json({ message: "Tous les champs sont requis." });
        }

        // Créer transaction côté expéditeur
        const transactionEnvoi = new TransactionRecent({
            numero_expediteur: Number(numero_expediteur),
            numero_destinataire,
            type_transaction: "envoi",
            montant: Number(montant),
            dateTransaction
        });

        // Créer transaction côté destinataire
        const transactionReception = new TransactionReception({
            numero_expediteur: Number(numero_expediteur),
            numero_destinataire,
            type_transaction: "reception",
            montant: Number(montant),
            dateTransaction
        });

        // Enregistrement simultané
        const [savedEnvoi, savedReception] = await Promise.all([
            transactionEnvoi.save(),
            transactionReception.save()
        ]);

        return res.status(201).json({
            message: "Transaction envoyée et reçue avec succès.",
            envoi: savedEnvoi,
            reception: savedReception
        });

    } catch (error) {
        console.error("Erreur lors de la création de la transaction :", error);
        return res.status(500).json({ message: "Erreur serveur" });
    }
};

module.exports = CreateTransaction;

const GetAllAccount = async (req, res) => {
    try {
        const AllAccounts = await AccountWave.find({})
        if (!AllAccounts) {
            return res.status(404).json({ message: "Aucun compte trouvé" })
        }
        return res.status(200).json({ AllAccounts })
    }
    catch (error) {
        return res.status(500).json({ message: "une erreur est survenue lors de la recuperation des comptes" })
    }
}
const DeleteAllTransaction = async (req, res) => {
    try {
        await TransactionRecent.deleteMany()
        await TransactionReception.deleteMany()
        return res.status(200).json({ message: "Toutes les transactions ont été supprimer" })
    }
    catch (error) {
        return res.status(500).json({ message: "une erreur est survenue lors de la suppression des transactions" })
    }
}
module.exports = {
    GetAccountWave,
    GetAllAccount,
    GetAllTransactions,
    CreateTransaction,
    DeleteAllTransaction,
    GetReception
}