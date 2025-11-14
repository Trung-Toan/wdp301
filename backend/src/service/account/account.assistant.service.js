const Account = require("../../model/auth/Account");
const Assistant = require("../../model/user/Assistant");
const User = require("../../model/user/User");
const mongoose = require("mongoose");

exports.findAccountByAssistantId = async (assistantId) => {
  const assistant = await Assistant.findById(assistantId);
    if (!assistant) throw new Error("Assistant not found");

  const user = await User.findById(assistant.user_id);
    if (!user) throw new Error("User not found");

  const account = await Account.findById(user.account_id);
  return account || null;
};

exports.deleteAssistantById = async (assistantId, status) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        let account = await this.findAccountByAssistantId(assistantId);
        account.status = status;
        const saved = await account.save({ session });
        await session.commitTransaction();
        session.endSession();
        return saved;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};