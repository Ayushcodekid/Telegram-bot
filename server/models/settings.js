const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  apiKey: { type: String, required: true },
});

module.exports = mongoose.model("Settings", settingsSchema);



//done