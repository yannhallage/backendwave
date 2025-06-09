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
        console.log(accountWave_personnel)
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

        const montantNumeric = Number(montant);
        console.log(numero_expediteur,numero_destinataire)
        // Récupérer les comptes
        const expediteur = await AccountWave.findOne({ numeroTel: numero_expediteur });
        const destinataire = await AccountWave.findOne({ numeroTel: numero_destinataire });

        if (!expediteur || !destinataire) {
            console.log("Compte expéditeur ou destinataire introuvable.")
            return res.status(404).json({ message: "Compte expéditeur ou destinataire introuvable." });
        }

        // Vérifier le solde suffisant
        if (expediteur.sold < montantNumeric) {
            console.log("Solde insuffisant pour effectuer la transaction.")
            return res.status(400).json({ message: "Solde insuffisant pour effectuer la transaction." });
        }

        // Mettre à jour les soldes
        expediteur.sold -= montantNumeric;
        destinataire.sold += montantNumeric;

        // Sauvegarder les soldes mis à jour
        await Promise.all([
            expediteur.save(),
            destinataire.save()
        ]);

        // Créer les deux transactions
        const transactionEnvoi = new TransactionRecent({
            numero_expediteur: Number(numero_expediteur),
            numero_destinataire,
            type_transaction: "envoi",
            montant: montantNumeric,
            dateTransaction
        });

        const transactionReception = new TransactionReception({
            numero_expediteur: Number(numero_expediteur),
            numero_destinataire,
            type_transaction: "reception",
            montant: montantNumeric,
            dateTransaction
        });

        const [savedEnvoi, savedReception] = await Promise.all([
            transactionEnvoi.save(),
            transactionReception.save()
        ]);

        return res.status(201).json({
            message: "Transaction effectuée avec succès.",
            envoi: savedEnvoi,
            reception: savedReception,
            soldExpediteur: expediteur.sold,
            soldDestinataire: destinataire.sold
        });

    } catch (error) {
        console.error("Erreur lors de la création de la transaction :", error);
        return res.status(500).json({ message: "Erreur serveur" });
    }
};


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