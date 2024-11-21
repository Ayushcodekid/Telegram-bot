require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const mongoose = require("mongoose");
const User = require("./models/user");

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Start command
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const user = await User.findOne({ chatId });

  if (!user) {
    await new User({ chatId }).save();
    bot.sendMessage(chatId, "Welcome! Use /subscribe to get weather updates.");
  } else {
    bot.sendMessage(chatId, "Welcome back! Use /subscribe to manage your subscription.");
  }
});

// Subscribe command
bot.onText(/\/subscribe/, async (msg) => {
  const chatId = msg.chat.id;
  const user = await User.findOne({ chatId });

  if (user) {
    user.subscribed = !user.subscribed;
    await user.save();

    const message = user.subscribed
      ? "You are now subscribed to weather updates!"
      : "You have unsubscribed from weather updates.";
    bot.sendMessage(chatId, message);
  }
});

// Weather update
const fetchWeather = async (location = "New York") => {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`
  );
  const data = await response.json();

  if (data.cod === 200) {
    return `Weather in ${data.name}: ${data.weather[0].description}. Temperature: ${data.main.temp}°C.`;
  }
  return "Error fetching weather data.";
};

// Broadcast updates
const sendWeatherUpdates = async () => {
  const subscribedUsers = await User.find({ subscribed: true });

  subscribedUsers.forEach(async (user) => {
    const weather = await fetchWeather();
    bot.sendMessage(user.chatId, weather);
  });
};

// Schedule updates every hour
setInterval(sendWeatherUpdates, 60000);
